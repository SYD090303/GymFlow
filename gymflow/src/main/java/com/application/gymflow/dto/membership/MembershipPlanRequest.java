package com.application.gymflow.dto.membership;

import com.application.gymflow.enums.membership.MembershipDuration;
import com.application.gymflow.enums.membership.PlanType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPlanRequest {

    @Schema(description = "Type of membership plan", example = "BASIC", required = true)
    @NotNull(message = "Plan type is required")
    private PlanType planType;

    @Schema(description = "Price of the plan in INR", example = "999.0", required = true)
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @Schema(description = "Detailed description of the plan", example = "Basic membership with access to gym equipment only", required = true)
    @NotBlank(message = "Description cannot be blank")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Schema(description = "Duration of the plan", example = "ONE_MONTH", required = true)
    @NotNull(message = "Duration is required")
    private MembershipDuration duration;

}
