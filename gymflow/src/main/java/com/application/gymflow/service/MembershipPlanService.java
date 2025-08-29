package com.application.gymflow.service;

import com.application.gymflow.dto.membership.MembershipPlanRequest;
import com.application.gymflow.dto.membership.MembershipPlanResponse;
import java.util.List;


/**
 * Service interface for managing {@link com.application.user_service.model.membershipplan.MembershipPlan} entities.
 * <p>
 * Provides methods for creating, updating, fetching, and deleting membership plans.
 * </p>
 */
public interface MembershipPlanService {

    /**
     * Creates a new membership plan.
     *
     * @param request {@link MembershipPlanRequest} containing plan details.
     * @return {@link MembershipPlanResponse} representing the created plan.
     */
    MembershipPlanResponse createPlan(MembershipPlanRequest request);

    /**
     * Updates an existing membership plan by ID.
     *
     * @param id      Long of the plan to update.
     * @param request {@link MembershipPlanRequest} containing updated plan details.
     * @return {@link MembershipPlanResponse} representing the updated plan.
     */
    MembershipPlanResponse updatePlan(Long id, MembershipPlanRequest request);

    /**
     * Fetches a membership plan by its ID.
     *
     * @param id Long of the plan to fetch.
     * @return {@link MembershipPlanResponse} representing the plan.
     */
    MembershipPlanResponse getPlanById(Long id);

    /**
     * Retrieves all membership plans.
     *
     * @return List of {@link MembershipPlanResponse} representing all plans.
     */
    List<MembershipPlanResponse> getAllPlans();

    /**
     * Deletes a membership plan by its ID.
     *
     * @param id Long of the plan to delete.
     */
    void deletePlan(Long id);

    /**
     * Activates a membership plan by setting its status to ACTIVE.
     *
     * @param id Long of the plan to activate
     */
    void activatePlan(Long id);

    /**
     * Deactivates a membership plan by setting its status to INACTIVE.
     *
     * @param id Long of the plan to deactivate
     */
    void deactivatePlan(Long id);
}
