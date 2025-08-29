package com.application.gymflow.exception.membership;

public class MembershipPlanNotFoundException extends RuntimeException {
    public MembershipPlanNotFoundException(String message) {
        super(message);
    }
}

