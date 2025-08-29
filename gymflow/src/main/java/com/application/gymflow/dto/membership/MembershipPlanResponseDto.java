package com.application.gymflow.dto.membership;

import com.application.gymflow.model.membership.MembershipPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanResponseDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer durationMonths;

    public static MembershipPlanResponseDto fromEntity(MembershipPlan plan) {
        if (plan == null) return null;
        return MembershipPlanResponseDto.builder()
                .id(plan.getId())
                .name(plan.getPlanType().name())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .durationMonths(plan.getDurationMonths())
                .build();
    }
}