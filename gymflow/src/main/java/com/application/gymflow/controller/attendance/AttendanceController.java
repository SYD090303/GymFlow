package com.application.gymflow.controller.attendance;

import com.application.gymflow.dto.member.AttendanceLogResponseDto;
import com.application.gymflow.dto.member.AttendanceRequestDto;
import com.application.gymflow.dto.member.AttendanceCheckInRequestDto;
import com.application.gymflow.dto.member.AttendanceCheckOutRequestDto;
import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.Member;
import com.application.gymflow.repository.member.AttendanceLogRepository;
import com.application.gymflow.service.MemberService;
import com.application.gymflow.service.AttendanceLogService;
import com.application.gymflow.util.MemberMapper;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.exception.member.MemberInactiveException;
import com.application.gymflow.exception.member.AttendanceOperationException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(
        name = "Attendance Management REST APIs",
        description = "REST APIs to log and query member attendance records"
)
@RestController
@RequestMapping(path = "/api/v1/attendance", produces = MediaType.APPLICATION_JSON_VALUE)
public class AttendanceController {

        private final MemberService memberService;
        private final AttendanceLogRepository attendanceLogRepository;
                private final MemberMapper memberMapper;
                private final AttendanceLogService attendanceLogService;

                public AttendanceController(MemberService memberService,
                                                                        AttendanceLogRepository attendanceLogRepository,
                                                                        MemberMapper memberMapper,
                                                                        AttendanceLogService attendanceLogService) {
                this.memberService = memberService;
                this.attendanceLogRepository = attendanceLogRepository;
                this.memberMapper = memberMapper;
                        this.attendanceLogService = attendanceLogService;
        }

        @Operation(summary = "Log Attendance for Member", description = "Creates a new attendance log (check-in) for the given member")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "HTTP Status CREATED"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND (Member not found)")
    })
        @PostMapping("/member/{memberId}/log")
    public ResponseEntity<AttendanceLogResponseDto> logAttendance(
            @PathVariable Long memberId,
            @RequestBody AttendanceRequestDto request
    ) {
        AttendanceLog log = memberService.logAttendance(memberId, request.getRecordedBy());
        return new ResponseEntity<>(memberMapper.toAttendanceLogResponseDto(log), HttpStatus.CREATED);
    }

        @Operation(summary = "Check-in Member", description = "Explicit check-in with optional timestamp and status")
                @PostMapping("/member/{memberId}/check-in")
        public ResponseEntity<AttendanceLogResponseDto> checkIn(
                        @PathVariable Long memberId,
                        @RequestBody(required = false) AttendanceCheckInRequestDto body
        ) {
                        Member member = memberService.getMemberById(memberId);
                        if (member.getStatus() != Status.ACTIVE) {
                                throw new MemberInactiveException("Member is inactive and cannot check in");
                        }
                        // Prevent duplicate check-in if there is already an open session
                        List<AttendanceLog> existing = attendanceLogRepository.findByMember(member);
                        AttendanceLog open = existing.stream()
                                .filter(l -> l.getCheckOutTime() == null)
                                .max(java.util.Comparator.comparing(AttendanceLog::getCheckInTime))
                                .orElse(null);
                        if (open != null) {
                                throw new AttendanceOperationException("Member is already checked in since " + open.getCheckInTime());
                        }
                        AttendanceLog log = AttendanceLog.builder()
                                        .member(member)
                                        .checkInTime(body != null && body.getCheckInTime() != null ? body.getCheckInTime() : java.time.LocalDateTime.now())
                                        .attendanceStatus(body != null && body.getAttendanceStatus() != null ? body.getAttendanceStatus() : AttendanceStatus.PRESENT)
                                        .build();
                        log = attendanceLogService.saveAttendanceLog(log);
                        return new ResponseEntity<>(memberMapper.toAttendanceLogResponseDto(log), HttpStatus.CREATED);
        }

        @Operation(summary = "Check-out Member", description = "Sets check-out time on the latest open attendance log for the member")
        @PostMapping("/member/{memberId}/check-out")
        public ResponseEntity<AttendanceLogResponseDto> checkOut(
                        @PathVariable Long memberId,
                        @RequestBody(required = false) AttendanceCheckOutRequestDto body
        ) {
                Member member = memberService.getMemberById(memberId);
                if (member.getStatus() != Status.ACTIVE) {
                        throw new MemberInactiveException("Member is inactive and cannot check out");
                }
                List<AttendanceLog> logs = attendanceLogRepository.findByMember(member);
                AttendanceLog latest = logs.stream()
                        .filter(l -> l.getCheckOutTime() == null)
                        .max(java.util.Comparator.comparing(AttendanceLog::getCheckInTime))
                        .orElse(null);
                if (latest == null) {
                        throw new AttendanceOperationException("No active check-in session to check out");
                }
                java.time.LocalDateTime outTime = body != null && body.getCheckOutTime() != null ? body.getCheckOutTime() : java.time.LocalDateTime.now();
                if (outTime.isBefore(latest.getCheckInTime())) {
                        throw new AttendanceOperationException("Check-out time cannot be before check-in time");
                }
                latest.setCheckOutTime(outTime);
                latest = attendanceLogRepository.save(latest);
                return ResponseEntity.ok(memberMapper.toAttendanceLogResponseDto(latest));
        }

    @Operation(summary = "List Attendance by Member", description = "Fetch all attendance logs for a specific member")
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<AttendanceLogResponseDto>> getAttendanceByMember(@PathVariable Long memberId) {
        Member member = memberService.getMemberById(memberId);
        if (member.getStatus() != Status.ACTIVE) {
                throw new MemberInactiveException("Member is inactive");
        }
        List<AttendanceLog> logs = attendanceLogRepository.findByMember(member);
        List<AttendanceLogResponseDto> response = logs.stream()
                .map(memberMapper::toAttendanceLogResponseDto)
                .toList();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "List Attendance by Status", description = "Fetch all attendance logs filtered by attendance status")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AttendanceLogResponseDto>> getAttendanceByStatus(@PathVariable AttendanceStatus status) {
        List<AttendanceLog> logs = attendanceLogRepository.findByAttendanceStatus(status);
        List<AttendanceLogResponseDto> response = logs.stream()
                .map(memberMapper::toAttendanceLogResponseDto)
                .toList();
        return ResponseEntity.ok(response);
    }

        @Operation(summary = "List Attendance in Date-Time Range", description = "Fetch all attendance logs within the given check-in date-time range (inclusive)")
    @GetMapping("/range")
    public ResponseEntity<List<AttendanceLogResponseDto>> getAttendanceInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        List<AttendanceLog> logs = attendanceLogRepository.findByCheckInTimeBetween(start, end);
        List<AttendanceLogResponseDto> response = logs.stream()
                .map(memberMapper::toAttendanceLogResponseDto)
                .toList();
        return ResponseEntity.ok(response);
    }

        @Operation(summary = "List Today's Attendance", description = "Fetch attendance logs for today")
        @GetMapping("/today")
        public ResponseEntity<List<AttendanceLogResponseDto>> getToday() {
                LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
                LocalDateTime end = start.plusDays(1).minusNanos(1);
                List<AttendanceLog> logs = attendanceLogRepository.findByCheckInTimeBetween(start, end);
                List<AttendanceLogResponseDto> response = logs.stream().map(memberMapper::toAttendanceLogResponseDto).toList();
                return ResponseEntity.ok(response);
        }
}
