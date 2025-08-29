package com.application.gymflow.repository.membership;

import com.application.gymflow.enums.membership.MembershipDuration;
import com.application.gymflow.enums.membership.PlanType;
import com.application.gymflow.model.membership.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for {@link MembershipPlan} entity.
 * <p>
 * Provides CRUD operations and custom query methods to fetch membership plans
 * based on their type or duration.
 * </p>
 * <p>
 * Extends {@link JpaRepository} which provides standard methods like:
 * <ul>
 *     <li>save()</li>
 *     <li>findById()</li>
 *     <li>findAll()</li>
 *     <li>deleteById()</li>
 * </ul>
 * </p>
 */
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {


    /**
     * Fetches a list of membership plans for a specific duration.
     *
     * @param duration the {@link MembershipDuration} to filter plans by
     *                 (e.g., ONE_MONTH, QUARTERLY, HALF_YEARLY, YEARLY)
     * @return list of {@link MembershipPlan} entities matching the given duration
     */
    List<MembershipPlan> findByDuration(MembershipDuration duration);

    Optional<MembershipPlan> findByPlanType(PlanType planType);
}
