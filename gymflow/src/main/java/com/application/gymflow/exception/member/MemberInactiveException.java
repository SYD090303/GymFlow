package com.application.gymflow.exception.member;

public class MemberInactiveException extends RuntimeException {
    public MemberInactiveException(String message) {
        super(message);
    }
}
