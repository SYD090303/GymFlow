package com.application.gymflow.enums.membership;

import lombok.Getter;

@Getter
public enum MembershipDuration {
    ONE_MONTH(1),
    THREE_MONTHS(3),
    SIX_MONTHS(6),
    TWELVE_MONTHS(12);

    private final int months;

    MembershipDuration(int months) {
        this.months = months;
    }
}