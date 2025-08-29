package com.application.gymflow.service;

import com.application.gymflow.dto.member.MemberRequestDto;
import com.application.gymflow.dto.member.MemberUpdateRequestDto;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.enums.member.RecordedByType;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.Member;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for managing Member entities.
 *
 * <p>This interface defines the core business logic for member-related operations,
 * including creation, retrieval, updates, deletion, and management of
 * associated entities like memberships, payments, and attendance logs.
 * </p>
 */
public interface MemberService {

    /**
     * Creates a new member and all associated records (user, membership, fitness profile, payment).
     *
     * @param requestDto The DTO containing the member's details.
     * @return The newly created Member entity.
     */
    Member createMember(MemberRequestDto requestDto);

    /**
     * Retrieves a member by their unique ID.
     *
     * @param id The ID of the member.
     * @return The found Member entity.
     */
    Member getMemberById(Long id);

    /**
     * Retrieves a list of all members in the system.
     *
     * @return A list of Member entities.
     */
    List<Member> getAllMembers();

    /**
     * Updates an existing member's details.
     *
     * @param id The ID of the member to update.
     * @param updateDto The DTO containing the updated details.
     * @return The updated Member entity.
     */
    Member updateMember(Long id, MemberUpdateRequestDto updateDto);

    /**
     * Deletes a member by their ID.
     *
     * @param id The ID of the member to delete.
     */
    void deleteMember(Long id);

    /**
     * Retrieves a member by their email address.
     *
     * @param email The email address of the member.
     * @return The found Member entity.
     */
    Member getMemberByEmail(String email);

    /**
     * Logs the attendance of a member.
     *
     * @param memberId The ID of the member.
     * @param recordedBy The type of entity that recorded the attendance (e.g., RECEPTIONIST).
     * @return The created AttendanceLog entity.
     */
    AttendanceLog logAttendance(Long memberId, RecordedByType recordedBy);

    /**
     * Retrieves a list of members whose membership ends before a given date.
     *
     * @param date The date to check against.
     * @return A list of Member entities.
     */
    List<Member> getMembersWithMembershipEndingBefore(LocalDate date);

    /**
     * Retrieves a list of members whose membership ends within a date range.
     *
     * @param start The start date of the range (inclusive).
     * @param end The end date of the range (inclusive).
     * @return A list of Member entities.
     */
    List<Member> getMembersWithMembershipEndingBetween(LocalDate start, LocalDate end);

    /**
     * Retrieves a list of members who have not made any payments.
     *
     * @return A list of Member entities.
     */
    List<Member> getMembersWithNoPayments();

    /**
     * Activates a member and their associated membership.
     *
     * @param memberId The ID of the member to activate.
     * @return The activated Member entity.
     */
    Member activateMember(Long memberId);

    /**
     * Deactivates a member and their associated membership.
     *
     * @param memberId The ID of the member to deactivate.
     * @return The deactivated Member entity.
     */
    Member deactivateMember(Long memberId);

    /**
     * Renews a member's membership, setting a new start and end date.
     *
     * @param memberId The ID of the member.
     * @param newStartDate The new start date for the renewed membership.
     * @return The Member entity with the renewed membership.
     */
    Member renewMembership(Long memberId, LocalDate newStartDate);

    /**
     * Retrieves a list of members with outstanding payments.
     *
     * @return A list of Member entities.
     */
    List<Member> getMembersWithOutstandingPayments();

    /**
     * Retrieves a list of members based on their membership status.
     *
     * @param status The membership status to filter by.
     * @return A list of Member entities.
     */
    List<Member> getMembersByMembershipStatus(MembershipStatus status);

    /**
     * Retrieves a list of members based on their overall status (ACTIVE/INACTIVE).
     *
     * @param status The member status to filter by.
     * @return A list of Member entities.
     */
    List<Member> getMembersByStatus(Status status);
}
