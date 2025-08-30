package com.application.gymflow.service.impl;

import com.application.gymflow.constants.MembershipPlanConstants;
import com.application.gymflow.dto.membership.MembershipPlanRequest;
import com.application.gymflow.dto.membership.MembershipPlanResponse;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.exception.membership.MembershipPlanNotFoundException;
import com.application.gymflow.model.membership.MembershipPlan;
import com.application.gymflow.repository.membership.MembershipPlanRepository;
import com.application.gymflow.service.MembershipPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of {@link MembershipPlanService} interface.
 * <p>
 * Provides concrete logic for creating, updating, fetching, and deleting membership plans.
 * Throws custom exceptions when plans are not found.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    public MembershipPlanResponse createPlan(MembershipPlanRequest request) {
        MembershipPlan plan = MembershipPlan.builder()
                .planType(request.getPlanType())
                .price(request.getPrice())
                .description(request.getDescription())
                .duration(request.getDuration())
                .status(Status.ACTIVE)
                .build();

        MembershipPlan savedPlan = membershipPlanRepository.save(plan);
        return mapToResponse(savedPlan);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public MembershipPlanResponse updatePlan(Long id, MembershipPlanRequest request) {
        MembershipPlan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new MembershipPlanNotFoundException(MembershipPlanConstants.MESSAGE_404));

        plan.setPlanType(request.getPlanType());
        plan.setPrice(request.getPrice());
        plan.setDescription(request.getDescription());
        plan.setDuration(request.getDuration());

        MembershipPlan updatedPlan = membershipPlanRepository.save(plan);
        return mapToResponse(updatedPlan);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public MembershipPlanResponse getPlanById(Long id) {
    MembershipPlan plan = membershipPlanRepository.findById(id)
        .filter(p -> p.getStatus() == Status.ACTIVE)
        .orElseThrow(() -> new MembershipPlanNotFoundException(MembershipPlanConstants.MESSAGE_404));
        return mapToResponse(plan);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<MembershipPlanResponse> getAllPlans() {
    return membershipPlanRepository.findAll()
        .stream()
        .filter(p -> p.getStatus() == Status.ACTIVE)
        .map(this::mapToResponse)
        .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deletePlan(Long id) {
    MembershipPlan plan = membershipPlanRepository.findById(id)
        .orElseThrow(() -> new MembershipPlanNotFoundException(MembershipPlanConstants.MESSAGE_404));
    // Soft delete: mark INACTIVE instead of physical delete
    plan.setStatus(Status.INACTIVE);
    membershipPlanRepository.save(plan);
    }

    @Override
    public void activatePlan(Long id) {
        MembershipPlan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new MembershipPlanNotFoundException(MembershipPlanConstants.MESSAGE_404));
        plan.setStatus(Status.ACTIVE);
        membershipPlanRepository.save(plan);
    }

    @Override
    public void deactivatePlan(Long id) {
        MembershipPlan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new MembershipPlanNotFoundException(MembershipPlanConstants.MESSAGE_404));
        plan.setStatus(Status.INACTIVE);
        membershipPlanRepository.save(plan);
    }


    /**
     * Maps {@link MembershipPlan} entity to {@link MembershipPlanResponse} DTO.
     *
     * @param plan Membership plan entity
     * @return MembershipPlanResponse DTO
     */
    private MembershipPlanResponse mapToResponse(MembershipPlan plan) {
        return MembershipPlanResponse.builder()
                .id(plan.getId())
                .planType(plan.getPlanType())
                .price(plan.getPrice())
                .description(plan.getDescription())
                .duration(plan.getDuration())
                .status(plan.getStatus())
                .build();
    }
}
