package com.application.gymflow.enums.common;

public enum Status {
    // General lifecycle
    ACTIVE,
    INACTIVE,
    DELETED,
    BANNED,
    PENDING,

    // Gym/Membership-specific
    SUSPENDED,     // Temporarily blocked (missed payment, violation, etc.)
    EXPIRED,       // Subscription or membership expired
    COMPLETED,     // Goal or program finished successfully
    FAILED,        // Goal/program attempt failed
    CANCELLED,     // User cancelled subscription/class/session
    UPCOMING,      // Booked but not yet started (class/training)
    IN_PROGRESS,   // Goal/class/session currently ongoing
    ON_HOLD        // Paused membership or training temporarily
}
