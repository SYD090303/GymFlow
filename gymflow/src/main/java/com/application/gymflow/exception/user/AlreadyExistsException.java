package com.application.gymflow.exception.user;

/**
 * Thrown when an entity already exists (e.g., duplicate email/phone).
 */
public class AlreadyExistsException extends RuntimeException {
    public AlreadyExistsException(String message) {
        super(message);
    }
}
