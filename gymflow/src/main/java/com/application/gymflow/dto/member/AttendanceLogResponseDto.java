package com.application.gymflow.dto.member;

import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.enums.member.RecordedByType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLogResponseDto {
    private Long id;
    private Long memberId;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private AttendanceStatus attendanceStatus;
    private RecordedByType recordedBy;
    private Long durationMinutes; // computed: minutes between check-in and check-out, if available
}