package com.application.gymflow.dto.member;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO for updating an existing member. All fields are optional and only provided fields will be updated.")
public class MemberUpdateRequestDto {

    private String email;
    private String firstName;
    private String lastName;
    private String phone;

    // Membership updates
    private Long membershipPlanId; // optional
    private LocalDate startDate;   // optional; when set together with plan recalculates endDate
    private Boolean autoRenew;     // optional

    // Fitness profile updates
    private Double height;               // optional
    private Double weight;               // optional
    private String medicalConditions;    // optional
    private String injuries;             // optional
    private String allergies;            // optional
}
