package com.application.gymflow.dto.member;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckOutRequestDto {
    @Schema(description = "Optional custom check-out time; defaults to now if not provided")
    private LocalDateTime checkOutTime;
}
