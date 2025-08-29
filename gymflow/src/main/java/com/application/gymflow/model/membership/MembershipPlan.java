package com.application.gymflow.model.membership;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.membership.MembershipDuration;
import com.application.gymflow.enums.membership.PlanType;
import com.application.gymflow.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "membership_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPlan extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = false)
    @NotNull(message = "Plan type is required")
    private PlanType planType;

    @Column(nullable = false)
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Description cannot be blank")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Duration is required")
    private MembershipDuration duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.ACTIVE;

    public int getDurationMonths() {
        return this.duration.getMonths();
    }
}