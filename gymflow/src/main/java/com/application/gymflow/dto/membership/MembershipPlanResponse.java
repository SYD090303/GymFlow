package com.application.gymflow.dto.membership;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.membership.MembershipDuration;
import com.application.gymflow.enums.membership.PlanType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPlanResponse {

    @Schema(description = "Unique identifier of the membership plan", example = "1")
    private Long id;

    @Schema(description = "Type of membership plan", example = "PREMIUM")
    private PlanType planType;

    @Schema(description = "Price of the plan in INR", example = "1999.0")
    private Double price;

    @Schema(description = "Detailed description of the plan", example = "Premium membership with access to gym equipment, sauna, and personal trainer")
    private String description;

    @Schema(description = "Duration of the plan", example = "YEARLY")
    private MembershipDuration duration;

    @Schema(description = "Current status of the plan", example = "ACTIVE")
    private Status status;

}
