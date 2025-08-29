package com.application.gymflow.controller.membership;

import com.application.gymflow.constants.MembershipPlanConstants;
import com.application.gymflow.dto.common.ResponseDto;
import com.application.gymflow.dto.membership.MembershipPlanRequest;
import com.application.gymflow.dto.membership.MembershipPlanResponse;
import com.application.gymflow.service.MembershipPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Tag(
        name = "Membership Plan Management REST APIs",
        description = "REST APIs in GymFlow to CREATE, UPDATE, FETCH and DELETE membership plans"
)
@RestController
@RequestMapping(path = "/api/v1/membership-plans", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanService membershipPlanService;

    // --- CRUD OPERATIONS ---

    @Operation(summary = "Create Membership Plan REST API",
            description = "REST API to create a new membership plan in the GymFlow system")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "HTTP Status CREATED"),
            @ApiResponse(responseCode = "400", description = "HTTP Status BAD REQUEST (Validation Error)"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PostMapping("/create")
    public ResponseEntity<MembershipPlanResponse> createPlan(@Valid @RequestBody MembershipPlanRequest request) {
        MembershipPlanResponse createdPlan = membershipPlanService.createPlan(request);
        return new ResponseEntity<>(createdPlan, HttpStatus.CREATED);
    }

    @Operation(summary = "Fetch Membership Plan by ID REST API",
            description = "REST API to fetch a membership plan's details based on a given ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlanResponse> getPlanById(@PathVariable Long id) {
        MembershipPlanResponse plan = membershipPlanService.getPlanById(id);
        return ResponseEntity.ok(plan);
    }

    @Operation(summary = "Fetch All Membership Plans REST API",
            description = "REST API to fetch all membership plan details from the GymFlow system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @GetMapping
    public ResponseEntity<List<MembershipPlanResponse>> getAllPlans() {
        List<MembershipPlanResponse> plans = membershipPlanService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    @Operation(summary = "Update Membership Plan REST API",
            description = "REST API to update an existing membership plan's details based on a given ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "400", description = "HTTP Status BAD REQUEST (Validation Error)"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MembershipPlanResponse> updatePlan(@PathVariable Long id, @Valid @RequestBody MembershipPlanRequest request) {
        MembershipPlanResponse updatedPlan = membershipPlanService.updatePlan(id, request);
        return ResponseEntity.ok(updatedPlan);
    }

    @Operation(summary = "Delete Membership Plan REST API",
            description = "REST API to delete a membership plan from the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deletePlan(@PathVariable Long id) {
        membershipPlanService.deletePlan(id);
        return ResponseEntity.ok(new ResponseDto(MembershipPlanConstants.STATUS_200, MembershipPlanConstants.PLAN_DELETED));
    }

    // --- STATUS MANAGEMENT ---

    @Operation(summary = "Activate Membership Plan REST API",
            description = "REST API to activate an inactive membership plan")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ResponseDto> activatePlan(@PathVariable Long id) {
        membershipPlanService.activatePlan(id);
        return ResponseEntity.ok(new ResponseDto(MembershipPlanConstants.STATUS_200, MembershipPlanConstants.PLAN_ACTIVATED));
    }

    @Operation(summary = "Deactivate Membership Plan REST API",
            description = "REST API to deactivate an active membership plan")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ResponseDto> deactivatePlan(@PathVariable Long id) {
        membershipPlanService.deactivatePlan(id);
        return ResponseEntity.ok(new ResponseDto(MembershipPlanConstants.STATUS_200, MembershipPlanConstants.PLAN_DEACTIVATED));
    }
}