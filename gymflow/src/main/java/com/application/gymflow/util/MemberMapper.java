package com.application.gymflow.util;

import com.application.gymflow.dto.member.AttendanceLogResponseDto;
import com.application.gymflow.dto.member.MemberResponseDto;

import com.application.gymflow.dto.membership.MembershipPlanResponseDto;
import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.FitnessProfile;
import com.application.gymflow.model.member.Membership;
import com.application.gymflow.model.membership.MembershipPlan;
import com.application.gymflow.enums.member.MembershipStatus;
import org.springframework.stereotype.Component;

@Component
public class MemberMapper {

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

        // Financial info (example, you may need to calculate outstandingBalance, lastPaymentDate)
        builder.outstandingBalance(null)
                .lastPaymentDate(null);

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