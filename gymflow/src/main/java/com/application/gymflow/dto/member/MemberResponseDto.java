package com.application.gymflow.dto.member;

import com.application.gymflow.dto.membership.MembershipPlanResponseDto;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.member.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponseDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePictureUrl;
    private Status status;

    // Membership Info
    private MembershipPlanResponseDto membershipPlan;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean autoRenew;
    private MembershipStatus membershipStatus;

    // Financial Info
    private Double outstandingBalance;
    private LocalDate lastPaymentDate;

    // Fitness Metrics
    private Double height;
    private Double weight;
    private String medicalConditions;
    private String injuries;
    private String allergies;
}