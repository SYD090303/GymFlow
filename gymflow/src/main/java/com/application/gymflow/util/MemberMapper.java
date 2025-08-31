package com.application.gymflow.util;

import com.application.gymflow.dto.member.AttendanceLogResponseDto;
import com.application.gymflow.dto.member.MemberResponseDto;

import com.application.gymflow.dto.membership.MembershipPlanResponseDto;
import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.FitnessProfile;
import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.Membership;
import com.application.gymflow.model.member.Payment;
import com.application.gymflow.model.membership.MembershipPlan;
import com.application.gymflow.repository.member.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MemberMapper {

    private final PaymentRepository paymentRepository;

    public MemberResponseDto toResponseDto(Member member) {
        if (member == null) return null;

        MemberResponseDto.MemberResponseDtoBuilder builder = MemberResponseDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .phone(member.getPhone())
                .profilePictureUrl(member.getProfilePictureUrl())
                .status(member.getStatus());

    Membership membership = member.getMembership();
        if (membership != null) {
            MembershipPlan plan = membership.getMembershipPlan();
            // Compute effective status from dates for robustness
            MembershipStatus effectiveStatus = membership.getMembershipStatus();
            if (membership.getStartDate() != null && membership.getEndDate() != null) {
                java.time.LocalDate today = java.time.LocalDate.now();
                if (effectiveStatus != MembershipStatus.CANCELLED) {
                    if (membership.getStartDate().isAfter(today)) {
                        effectiveStatus = MembershipStatus.PENDING;
                    } else if (membership.getEndDate().isBefore(today)) {
                        effectiveStatus = MembershipStatus.EXPIRED;
                    } else {
                        effectiveStatus = MembershipStatus.ACTIVE;
                    }
                }
            }
            builder.membershipPlan(plan != null ? MembershipPlanResponseDto.fromEntity(plan) : null)
                    .startDate(membership.getStartDate())
                    .endDate(membership.getEndDate())
                    .autoRenew(membership.isAutoRenew())
                    .membershipStatus(effectiveStatus);
        }

        FitnessProfile profile = member.getFitnessProfile();
        if (profile != null) {
            builder.height(profile.getHeight())
                    .weight(profile.getWeight())
                    .medicalConditions(profile.getMedicalConditions())
                    .injuries(profile.getInjuries())
                    .allergies(profile.getAllergies());
        }

        // Financial info: compute last payment date and outstanding balance for current cycle
        java.time.LocalDate lastPaymentDate = null;
        Double outstandingBalance = null;

        try {
            // Last payment date (global for the member)
            var latest = paymentRepository.findByMemberOrderByPaymentDateDesc(member);
            if (latest != null && !latest.isEmpty()) {
                lastPaymentDate = latest.getFirst().getPaymentDate();
            }

            // Outstanding balance for current membership cycle
            if (membership != null && membership.getMembershipPlan() != null
                    && membership.getStartDate() != null && membership.getEndDate() != null) {
                Double planPrice = membership.getMembershipPlan().getPrice();
                if (planPrice != null && planPrice > 0) {
                    java.util.List<Payment> cyclePayments = paymentRepository
                            .findByMemberAndPaymentDateBetween(member, membership.getStartDate(), membership.getEndDate());
                    double paid = (cyclePayments == null) ? 0.0 : cyclePayments.stream()
                            .mapToDouble(p -> p.getAmountPaid() == null ? 0.0 : p.getAmountPaid())
                            .sum();
                    double remaining = planPrice - paid;
                    outstandingBalance = remaining > 0 ? remaining : 0.0;
                } else {
                    outstandingBalance = 0.0;
                }
            }
        } catch (Exception ignored) {
            // Fail-safe: leave financial fields null if any issue occurs
        }

        builder.outstandingBalance(outstandingBalance)
                .lastPaymentDate(lastPaymentDate);

        return builder.build();
    }

    public AttendanceLogResponseDto toAttendanceLogResponseDto(AttendanceLog log) {
        if (log == null) return null;
        Long duration = null;
        if (log.getCheckInTime() != null && log.getCheckOutTime() != null) {
            duration = java.time.Duration.between(log.getCheckInTime(), log.getCheckOutTime()).toMinutes();
        }
        return AttendanceLogResponseDto.builder()
                .id(log.getId())
                .memberId(log.getMember().getId())
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .attendanceStatus(log.getAttendanceStatus())
                .recordedBy(log.getRecordedBy())
                .durationMinutes(duration)
                .build();
    }
}