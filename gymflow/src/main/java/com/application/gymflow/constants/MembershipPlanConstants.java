package com.application.gymflow.constants;

public final class MembershipPlanConstants {

    private MembershipPlanConstants() {
        // private constructor to prevent instantiation
    }

    // =======================
    // Status Codes
    // =======================
    public static final String STATUS_200 = "200";
    public static final String STATUS_201 = "201";
    public static final String STATUS_400 = "400";
    public static final String STATUS_404 = "404";
    public static final String STATUS_417 = "417";
    public static final String STATUS_500 = "500";

    // =======================
    // Generic Messages
    // =======================
    public static final String MESSAGE_200 = "Operation successful";
    public static final String MESSAGE_201 = "Membership plan created successfully";
    public static final String MESSAGE_400 = "Invalid request data";
    public static final String MESSAGE_404 = "Membership plan not found";
    public static final String MESSAGE_417 = "Operation failed, please try again";
    public static final String MESSAGE_500 = "Internal server error, please contact support";

    // =======================
    // Domain-Specific Messages
    // =======================
    public static final String PLAN_UPDATED = "Membership plan updated successfully";
    public static final String PLAN_DELETED = "Membership plan deleted successfully";
    public static final String PLAN_ACTIVATED = "Membership plan activated successfully";
    public static final String PLAN_DEACTIVATED = "Membership plan deactivated successfully";
}
