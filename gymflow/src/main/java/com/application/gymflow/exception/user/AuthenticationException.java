package com.application.gymflow.exception.user;

/**
 * Thrown when authentication fails (e.g., invalid credentials).
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}
