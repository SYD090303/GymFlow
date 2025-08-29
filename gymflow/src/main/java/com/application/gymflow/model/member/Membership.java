package com.application.gymflow.model.member;

import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.model.BaseEntity;
import com.application.gymflow.model.membership.MembershipPlan;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

@Entity
@Table(name = "memberships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Membership extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membership_plan_id", nullable = false)
    private MembershipPlan membershipPlan;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean autoRenew;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private MembershipStatus membershipStatus;

    private LocalDate renewalDate;

    @PrePersist
    @PreUpdate
    private void syncMembershipStatus() {
        // Don't override cancelled explicitly set by business logic
        if (this.membershipStatus == MembershipStatus.CANCELLED) {
            return;
        }
        final LocalDate today = LocalDate.now();
        if (this.startDate != null && this.startDate.isAfter(today)) {
            this.membershipStatus = MembershipStatus.PENDING;
            return;
        }
        if (this.endDate != null && this.endDate.isBefore(today)) {
            this.membershipStatus = MembershipStatus.EXPIRED;
            return;
        }
        this.membershipStatus = MembershipStatus.ACTIVE;
    }
}