package com.application.gymflow.model.member;

import com.application.gymflow.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "fitness_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FitnessProfile extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @NotNull
    @DecimalMin("50.0")
    @DecimalMax("250.0")
    private Double height;

    @NotNull
    @DecimalMin("20.0")
    @DecimalMax("300.0")
    private Double weight;

    @Lob
    private String medicalConditions;

    @Lob
    private String injuries;

    @Lob
    private String allergies;
}