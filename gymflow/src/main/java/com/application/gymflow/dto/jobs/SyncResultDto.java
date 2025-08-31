package com.application.gymflow.dto.jobs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncResultDto {
    private int updates;
    private int toActive;
    private int toExpired;
    private int toPending;
    private String message;
}
