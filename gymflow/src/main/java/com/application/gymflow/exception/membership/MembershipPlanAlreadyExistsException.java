package com.application.gymflow.exception.membership;

public class MembershipPlanAlreadyExistsException extends RuntimeException {
    public MembershipPlanAlreadyExistsException(String message) {
        super(message);
    }
}
