package com.application.gymflow.controller.member;

import com.application.gymflow.constants.MemberConstants;
import com.application.gymflow.dto.common.ResponseDto;
import com.application.gymflow.dto.member.AttendanceRequestDto;
import com.application.gymflow.dto.member.MemberRequestDto;
import com.application.gymflow.dto.member.MemberUpdateRequestDto;
import com.application.gymflow.dto.member.MemberResponseDto;
import com.application.gymflow.dto.member.AttendanceLogResponseDto;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.Member;
import com.application.gymflow.service.MemberService;


import com.application.gymflow.util.MemberMapper;
import com.application.gymflow.exception.member.MemberNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
 
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(
        name = "Member Management REST APIs",
        description = "REST APIs in GymFlow to CREATE, UPDATE, FETCH and DELETE member details"
)
@RestController
@RequestMapping(path = "/api/v1/members", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberMapper memberMapper;

    // --- CRUD OPERATIONS ---

    @Operation(summary = "Create Member REST API", description = "REST API to create a new Member in the GymFlow system")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "HTTP Status CREATED"),
            @ApiResponse(responseCode = "400", description = "HTTP Status BAD REQUEST (Validation Error)"),
            @ApiResponse(responseCode = "409", description = "HTTP Status CONFLICT (Email/Phone already exists)"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PostMapping("/create")
    public ResponseEntity<MemberResponseDto> createMember(@Valid @RequestBody MemberRequestDto requestDto) {
        Member createdMember = memberService.createMember(requestDto);
        MemberResponseDto responseDto = memberMapper.toResponseDto(createdMember);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @Operation(summary = "Fetch Member by ID REST API", description = "REST API to fetch a Member's details based on a given ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponseDto> getMemberById(@PathVariable Long id) {
        Member member = memberService.getMemberById(id);
        // Hide soft-deleted/inactive members from direct fetch by id
        if (member.getStatus() != Status.ACTIVE) {
            throw new MemberNotFoundException("Member not found with ID: " + id);
        }
        return ResponseEntity.ok(memberMapper.toResponseDto(member));
    }

    @Operation(summary = "Fetch All Members REST API", description = "REST API to fetch all Member details from the GymFlow system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> getAllMembers() {
        List<Member> members = memberService.getAllMembers();
        List<MemberResponseDto> responseDtos = members.stream()
                .map(memberMapper::toResponseDto)
                .toList();
        return ResponseEntity.ok(responseDtos);
    }

    @Operation(summary = "Update Member REST API", description = "REST API to update an existing Member's details based on a given ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "400", description = "HTTP Status BAD REQUEST (Validation Error)"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MemberResponseDto> updateMember(@PathVariable Long id, @Valid @RequestBody MemberUpdateRequestDto updateDto) {
        Member updatedMember = memberService.updateMember(id, updateDto);
        return ResponseEntity.ok(memberMapper.toResponseDto(updatedMember));
    }

    @Operation(summary = "Delete Member REST API", description = "REST API to soft delete a Member (marks as inactive)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(new ResponseDto(MemberConstants.STATUS_200, "Member deleted successfully"));
    }

    // --- STATUS & STATE MANAGEMENT ---

    @Operation(summary = "Activate Member REST API", description = "REST API to activate an inactive Member")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PutMapping("/activate/{id}")
    public ResponseEntity<MemberResponseDto> activateMember(@PathVariable Long id) {
        Member activatedMember = memberService.activateMember(id);
        return ResponseEntity.ok(memberMapper.toResponseDto(activatedMember));
    }

    @Operation(summary = "Deactivate Member REST API", description = "REST API to deactivate an active Member")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<MemberResponseDto> deactivateMember(@PathVariable Long id) {
        Member deactivatedMember = memberService.deactivateMember(id);
        return ResponseEntity.ok(memberMapper.toResponseDto(deactivatedMember));
    }

    // --- ATTENDANCE & MEMBERSHIP ---

    @Operation(summary = "Log Member Attendance", description = "REST API to log a new attendance record for a member")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "HTTP Status CREATED"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND (Member not found)"),
            @ApiResponse(responseCode = "403", description = "HTTP Status FORBIDDEN (Member is inactive)"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PostMapping("/{memberId}/attendance")
    public ResponseEntity<AttendanceLogResponseDto> logAttendance(@PathVariable Long memberId, @RequestBody AttendanceRequestDto request) {
        AttendanceLog log = memberService.logAttendance(memberId, request.getRecordedBy());
        return new ResponseEntity<>(memberMapper.toAttendanceLogResponseDto(log), HttpStatus.CREATED);
    }

    @Operation(summary = "Renew Member's Membership", description = "REST API to renew a member's membership")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @PostMapping("/{id}/renew-membership")
    public ResponseEntity<MemberResponseDto> renewMembership(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newStartDate) {
        Member renewedMember = memberService.renewMembership(id, newStartDate);
        return ResponseEntity.ok(memberMapper.toResponseDto(renewedMember));
    }

    // --- SEARCH & FILTER OPERATIONS ---

    @Operation(summary = "Fetch Member by Email REST API", description = "REST API to fetch a Member's details by email")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "HTTP Status OK"),
            @ApiResponse(responseCode = "404", description = "HTTP Status NOT FOUND"),
            @ApiResponse(responseCode = "500", description = "HTTP Status INTERNAL SERVER ERROR")
    })
    @GetMapping("/by-email")
    public ResponseEntity<MemberResponseDto> getMemberByEmail(@RequestParam String email) {
        Member member = memberService.getMemberByEmail(email);
        return ResponseEntity.ok(memberMapper.toResponseDto(member));
    }

    @Operation(summary = "Fetch Current Member (Self)", description = "Fetch the authenticated member's details based on JWT email")
    @GetMapping("/me")
    public ResponseEntity<MemberResponseDto> getCurrentMember(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        Member member = memberService.getMemberByEmail(email);
        return ResponseEntity.ok(memberMapper.toResponseDto(member));
    }

    @Operation(summary = "Fetch Members by Status", description = "REST API to get all members with a given status (ACTIVE/INACTIVE)")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MemberResponseDto>> getMembersByStatus(@PathVariable Status status) {
        List<Member> members = memberService.getMembersByStatus(status);
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }

    @Operation(summary = "Fetch Members by Membership Status", description = "REST API to get all members with a given membership status (e.g., ACTIVE, EXPIRED)")
    @GetMapping("/membership-status/{status}")
    public ResponseEntity<List<MemberResponseDto>> getMembersByMembershipStatus(@PathVariable MembershipStatus status) {
        List<Member> members = memberService.getMembersByMembershipStatus(status);
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }

    @Operation(summary = "Fetch Members with Expiring Memberships", description = "REST API to find members whose membership ends before a specified date")
    @GetMapping("/membership/ending-before")
    public ResponseEntity<List<MemberResponseDto>> getMembersWithMembershipEndingBefore(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Member> members = memberService.getMembersWithMembershipEndingBefore(date);
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }

    @Operation(summary = "Fetch Members with Memberships Expiring in Date Range", description = "REST API to find members whose membership ends between two specified dates")
    @GetMapping("/membership/ending-between")
    public ResponseEntity<List<MemberResponseDto>> getMembersWithMembershipEndingBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<Member> members = memberService.getMembersWithMembershipEndingBetween(start, end);
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }

    @Operation(summary = "Fetch Members with Outstanding Payments", description = "REST API to find all members who have outstanding payments")
    @GetMapping("/payments/outstanding")
    public ResponseEntity<List<MemberResponseDto>> getMembersWithOutstandingPayments() {
        List<Member> members = memberService.getMembersWithOutstandingPayments();
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }

    @Operation(summary = "Fetch Members with No Payments", description = "REST API to find all members who have never made a payment")
    @GetMapping("/payments/none")
    public ResponseEntity<List<MemberResponseDto>> getMembersWithNoPayments() {
        List<Member> members = memberService.getMembersWithNoPayments();
        return ResponseEntity.ok(members.stream().map(memberMapper::toResponseDto).toList());
    }
}