package com.application.gymflow.exception.user;

/**
 * Thrown when requested resource is not found (e.g., user not found).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
