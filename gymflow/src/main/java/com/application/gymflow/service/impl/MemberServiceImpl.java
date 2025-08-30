package com.application.gymflow.service.impl;

import com.application.gymflow.dto.auth.RegisterRequest;
import com.application.gymflow.dto.member.MemberRequestDto;
import com.application.gymflow.dto.member.MemberUpdateRequestDto;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.enums.member.RecordedByType;
import com.application.gymflow.exception.member.DuplicateMemberException;
import com.application.gymflow.exception.member.MemberNotFoundException;
import com.application.gymflow.exception.membership.MembershipPlanNotFoundException;
import com.application.gymflow.model.auth.Role;
import com.application.gymflow.model.member.*;
import com.application.gymflow.model.membership.MembershipPlan;
import com.application.gymflow.repository.member.*;
import com.application.gymflow.repository.auth.UserRepository;
import com.application.gymflow.repository.membership.MembershipPlanRepository;
import com.application.gymflow.service.MemberService;
import com.application.gymflow.service.auth.AuthService;

import com.application.gymflow.service.AttendanceLogService;
import com.application.gymflow.exception.member.MemberInactiveException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service implementation for managing Member entities.
 *
 * <p>This class provides the business logic for all member-related operations,
 * including creating, retrieving, updating, and deleting member records. It
 * also handles the integration with other services to manage associated
 * data such as memberships, payments, fitness profiles, and user authentication.</p>
 *
 * <p>The methods within this class are designed to be transactional where necessary,
 * ensuring data consistency for complex operations like creating or updating a member.</p>
 */
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final MembershipPlanRepository membershipPlanRepository;
    private final MembershipRepository membershipRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceLogService attendanceLogService;
    private final AuthService authService;
    private final UserRepository userRepository;

    /**
     * Creates a new member and all associated records (user, membership, fitness profile, payment).
     *
     * <p>This method performs a series of steps to fully onboard a new member:
     * <ul>
     * <li>It first checks for an existing member with the same email to prevent duplicates.</li>
     * <li>It creates a new user account for the member via the authentication service.</li>
     * <li>It retrieves the specified membership plan to link to the new member.</li>
     * <li>It creates and saves the core {@link Member}, {@link Membership},
     * {@link FitnessProfile}, and initial {@link Payment} records.</li>
     * </ul></p>
     *
     * @param requestDto The DTO containing the member's details.
     * @return The newly created Member entity.
     * @throws DuplicateMemberException if a member with the same email already exists.
     * @throws MembershipPlanNotFoundException if the specified membership plan does not exist.
     */
    @Override
    @Transactional
    public Member createMember(MemberRequestDto requestDto) {
        // 1. Check for duplicate member by email before proceeding.
        memberRepository.findByEmail(requestDto.getEmail()).ifPresent(existingMember -> {
            throw new DuplicateMemberException("Member already exists with email: " + requestDto.getEmail());
        });

        // 2. Create the user in the authentication service.
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(requestDto.getEmail())
                .password(requestDto.getPassword())
                .firstName(requestDto.getFirstName())
                .lastName(requestDto.getLastName())
                .roleName(Role.RoleName.MEMBER)
                .status(Status.ACTIVE)
                .build();
        authService.createUser(registerRequest);

        // 3. Find the membership plan to link.
        MembershipPlan membershipPlan = membershipPlanRepository.findById(requestDto.getMembershipPlanId())
                .orElseThrow(() -> new MembershipPlanNotFoundException("Membership plan not found with ID: " + requestDto.getMembershipPlanId()));

        // 4. Create and save the core Member entity.
        Member member = Member.builder()
                .email(requestDto.getEmail())
                .firstName(requestDto.getFirstName())
                .lastName(requestDto.getLastName())
                .phone(requestDto.getPhone())
                .status(Status.ACTIVE)
                .build();
        memberRepository.save(member);

        // 5. Create and save the Membership record.
        LocalDate endDate = requestDto.getStartDate().plusMonths(membershipPlan.getDurationMonths());
        Membership membership = Membership.builder()
                .member(member)
                .membershipPlan(membershipPlan)
                .startDate(requestDto.getStartDate())
                .endDate(endDate)
                .autoRenew(requestDto.isAutoRenew())
                .membershipStatus(MembershipStatus.ACTIVE)
                .renewalDate(endDate)
                .build();
        membershipRepository.save(membership);

        // 6. Create and save the FitnessProfile record.
        FitnessProfile fitnessProfile = FitnessProfile.builder()
                .member(member)
                .height(requestDto.getHeight())
                .weight(requestDto.getWeight())
                .medicalConditions(requestDto.getMedicalConditions())
                .injuries(requestDto.getInjuries())
                .allergies(requestDto.getAllergies())
                .build();
        fitnessProfileRepository.save(fitnessProfile);

        // 7. Create and save the initial Payment record.
        Payment payment = Payment.builder()
                .member(member)
                .amountPaid(requestDto.getAmountPaid())
                .paymentDate(LocalDate.now())
                .paymentMethod(requestDto.getPaymentMethod())
                .build();
        paymentRepository.save(payment);

        return member;
    }

    /**
     * Retrieves a member by their unique ID.
     *
     * @param id The ID of the member.
     * @return The found Member entity.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     */
    @Override
    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with ID: " + id));
    }

    /**
     * Retrieves a list of all members in the system.
     *
     * @return A list of Member entities.
     */
    @Override
    public List<Member> getAllMembers() {
    // By default, only show ACTIVE members (soft-deleted are INACTIVE)
    return memberRepository.findAll().stream()
        .filter(m -> m.getStatus() == Status.ACTIVE)
        .toList();
    }

    /**
     * Updates an existing member's details.
     *
     * <p>This method updates the core member information, their fitness profile,
     * and their membership details. It handles email uniqueness validation and
     * recalculates the membership end date if the plan or start date changes.</p>
     *
     * @param id The ID of the member to update.
     * @param updateDto The DTO containing the updated details.
     * @return The updated Member entity.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     * @throws DuplicateMemberException if the new email already exists for another member.
     * @throws MembershipPlanNotFoundException if the specified new membership plan does not exist.
     */
    @Override
    @Transactional
    public Member updateMember(Long id, MemberUpdateRequestDto updateDto) {
        Member existingMember = getMemberById(id);

        // Check for duplicate email
        if (updateDto.getEmail() != null && !existingMember.getEmail().equals(updateDto.getEmail())) {
            Optional<Member> memberWithNewEmail = memberRepository.findByEmail(updateDto.getEmail());
            if (memberWithNewEmail.isPresent() && !memberWithNewEmail.get().getId().equals(id)) {
                throw new DuplicateMemberException("Email '" + updateDto.getEmail() + "' is already in use by another member.");
            }
        }

        // Update core member fields
        if (updateDto.getEmail() != null) existingMember.setEmail(updateDto.getEmail());
        if (updateDto.getFirstName() != null) existingMember.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) existingMember.setLastName(updateDto.getLastName());
        if (updateDto.getPhone() != null) existingMember.setPhone(updateDto.getPhone());

        // Update fitness profile
        FitnessProfile fitnessProfile = existingMember.getFitnessProfile();
        if (fitnessProfile != null) {
            if (updateDto.getHeight() != null) fitnessProfile.setHeight(updateDto.getHeight());
            if (updateDto.getWeight() != null) fitnessProfile.setWeight(updateDto.getWeight());
            if (updateDto.getMedicalConditions() != null) fitnessProfile.setMedicalConditions(updateDto.getMedicalConditions());
            if (updateDto.getInjuries() != null) fitnessProfile.setInjuries(updateDto.getInjuries());
            if (updateDto.getAllergies() != null) fitnessProfile.setAllergies(updateDto.getAllergies());
            fitnessProfileRepository.save(fitnessProfile);
        }

        // Update membership details
        Membership membership = existingMember.getMembership();
        if (membership != null) {
            // Determine the plan to use for duration
            MembershipPlan effectivePlan = membership.getMembershipPlan();
            if (updateDto.getMembershipPlanId() != null) {
                effectivePlan = membershipPlanRepository.findById(updateDto.getMembershipPlanId())
                        .orElseThrow(() -> new MembershipPlanNotFoundException("Membership plan not found with ID: " + updateDto.getMembershipPlanId()));
                membership.setMembershipPlan(effectivePlan);
            }
            // If startDate is provided, update it and recalc end/renewal using effective plan
            if (updateDto.getStartDate() != null && effectivePlan != null) {
                membership.setStartDate(updateDto.getStartDate());
                LocalDate newEndDate = updateDto.getStartDate().plusMonths(effectivePlan.getDurationMonths());
                membership.setEndDate(newEndDate);
                membership.setRenewalDate(newEndDate);
            }
            if (updateDto.getAutoRenew() != null) membership.setAutoRenew(updateDto.getAutoRenew());
            membershipRepository.save(membership);
        }

        return memberRepository.save(existingMember);
    }

    /**
     * Deletes a member by their ID.
     *
     * @param id The ID of the member to delete.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     */
    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with ID: " + id));

        // Soft delete: mark member as INACTIVE
        member.setStatus(Status.INACTIVE);

        // If membership exists, cancel it
        Membership membership = member.getMembership();
        if (membership != null) {
            membership.setMembershipStatus(MembershipStatus.CANCELLED);
            membershipRepository.save(membership);
        }

        // Also mark corresponding User as INACTIVE if present
        userRepository.findByEmail(member.getEmail()).ifPresent(user -> {
            user.setStatus(Status.INACTIVE);
            userRepository.save(user);
        });

        memberRepository.save(member);
    }

    /**
     * Retrieves a member by their email address.
     *
     * @param email The email address of the member.
     * @return The found Member entity.
     * @throws MemberNotFoundException if the member with the given email does not exist.
     */
    @Override
    public Member getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with email: " + email));
    }

    /**
     * Logs the attendance of a member.
     *
     * <p>This method retrieves a member and creates a new attendance log record
     * with the current timestamp and a status of {@link AttendanceStatus#PRESENT}.
     * It then delegates the saving of the log to the dedicated {@link AttendanceLogService}.</p>
     *
     * @param memberId The ID of the member.
     * @param recordedBy The type of entity that recorded the attendance (e.g., RECEPTIONIST).
     * @return The created AttendanceLog entity.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     */
    @Override
    @Transactional
    public AttendanceLog logAttendance(Long memberId, RecordedByType recordedBy) {
        Member member = getMemberById(memberId);

        // Block attendance logging for inactive/soft-deleted members
        if (member.getStatus() != Status.ACTIVE) {
            throw new MemberInactiveException("Member is inactive and cannot log attendance");
        }

        AttendanceLog attendanceLog = AttendanceLog.builder()
                .member(member)
                .checkInTime(LocalDateTime.now())
                .attendanceStatus(AttendanceStatus.PRESENT)
                .build();

        // Delegate saving to the dedicated service, which will handle the recordedBy field
        return attendanceLogService.saveAttendanceLog(attendanceLog);
    }

    /**
     * Retrieves a list of members whose membership is set to expire before a specific date.
     *
     * @param date The date to check against.
     * @return A list of {@link Member} entities whose membership ends before the given date.
     */
    public List<Member> getMembersWithMembershipEndingBefore(LocalDate date) {
        return memberRepository.findByMembership_EndDateBefore(date);
    }

    /**
     * Retrieves a list of members whose membership ends within a specified date range.
     *
     * @param start The start date of the range (inclusive).
     * @param end The end date of the range (inclusive).
     * @return A list of {@link Member} entities whose membership ends within the given range.
     */
    public List<Member> getMembersWithMembershipEndingBetween(LocalDate start, LocalDate end) {
        return memberRepository.findByMembership_EndDateBetween(start, end);
    }

    /**
     * Retrieves a list of members who have not made any payments.
     *
     * @return A list of {@link Member} entities.
     */
    public List<Member> getMembersWithNoPayments() {
        return memberRepository.findByPaymentsIsEmpty();
    }

    /**
     * Activates a member's account and their current membership.
     *
     * <p>This method sets the member's status to {@link Status#ACTIVE} and their
     * membership status to {@link MembershipStatus#ACTIVE}.</p>
     *
     * @param memberId The ID of the member to activate.
     * @return The updated {@link Member} entity.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     */
    @Transactional
    public Member activateMember(Long memberId) {
        Member member = getMemberById(memberId);
        member.setStatus(Status.ACTIVE);

        Membership membership = member.getMembership();
        if (membership != null) {
            membership.setMembershipStatus(MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
        }
        return memberRepository.save(member);
    }

    /**
     * Deactivates a member's account and their current membership.
     *
     * <p>This method sets the member's status to {@link Status#INACTIVE} and their
     * membership status to {@link MembershipStatus#CANCELLED}.</p>
     *
     * @param memberId The ID of the member to deactivate.
     * @return The updated {@link Member} entity.
     * @throws MemberNotFoundException if the member with the given ID does not exist.
     */
    @Transactional
    public Member deactivateMember(Long memberId) {
        Member member = getMemberById(memberId);
        member.setStatus(Status.INACTIVE);

        Membership membership = member.getMembership();
        if (membership != null) {
            membership.setMembershipStatus(MembershipStatus.CANCELLED);
            membershipRepository.save(membership);
        }
        return memberRepository.save(member);
    }

    /**
     * Renews a member's existing membership by updating its start and end dates.
     *
     * <p>The new end date is calculated based on the renewed start date and the
     * duration of the member's current {@link MembershipPlan}. It also sets the
     * membership and member status to active.</p>
     *
     * @param memberId The ID of the member.
     * @param newStartDate The new start date for the renewed membership.
     * @return The updated {@link Member} entity.
     * @throws MemberNotFoundException if the member or their membership does not exist.
     */
    @Transactional
    public Member renewMembership(Long memberId, LocalDate newStartDate) {
        Member member = getMemberById(memberId);
        Membership membership = member.getMembership();
        if (membership == null) {
            throw new MemberNotFoundException("Membership not found for member ID: " + memberId);
        }
        MembershipPlan plan = membership.getMembershipPlan();
        LocalDate newEndDate = newStartDate.plusMonths(plan.getDurationMonths());

        membership.setStartDate(newStartDate);
        membership.setEndDate(newEndDate);
        membership.setRenewalDate(newEndDate);
        membership.setMembershipStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        member.setStatus(Status.ACTIVE);
        return memberRepository.save(member);
    }

    /**
     * Retrieves a list of members with outstanding payments.
     *
     * <p>This implementation currently returns members who have not made any payments at all.
     * This logic can be extended to check for negative balances or overdue payments.</p>
     *
     * @return A list of {@link Member} entities with outstanding payments.
     */
    public List<Member> getMembersWithOutstandingPayments() {
        // Example: Members with no payments
        return memberRepository.findByPaymentsIsEmpty();
    }

    /**
     * Retrieves a list of members based on their membership status.
     *
     * @param status The {@link MembershipStatus} to filter by (e.g., ACTIVE, EXPIRED, CANCELLED).
     * @return A list of {@link Member} entities.
     */
    public List<Member> getMembersByMembershipStatus(MembershipStatus status) {
        return memberRepository.findAll().stream()
                .filter(m -> m.getMembership() != null && m.getMembership().getMembershipStatus() == status)
                .toList();
    }

    /**
     * Retrieves a list of members based on their overall status.
     *
     * @param status The {@link Status} to filter by (e.g., ACTIVE, INACTIVE).
     * @return A list of {@link Member} entities.
     */
    public List<Member> getMembersByStatus(Status status) {
        return memberRepository.findAll().stream()
                .filter(m -> m.getStatus() == status)
                .toList();
    }

}