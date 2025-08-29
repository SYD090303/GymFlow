package com.application.gymflow.dto.member;

import com.application.gymflow.enums.member.AttendanceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckInRequestDto {
    @Schema(description = "Optional custom check-in time; defaults to now if not provided")
    private LocalDateTime checkInTime;

    @Schema(description = "Optional attendance status; defaults to PRESENT")
    private AttendanceStatus attendanceStatus;
}
