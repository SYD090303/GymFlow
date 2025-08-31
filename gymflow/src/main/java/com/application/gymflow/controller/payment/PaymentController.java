package com.application.gymflow.controller.payment;

import com.application.gymflow.dto.payment.PaymentRequestDto;
import com.application.gymflow.dto.payment.PaymentResponseDto;
import com.application.gymflow.model.member.Payment;
import com.application.gymflow.repository.member.MemberRepository;
import com.application.gymflow.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "Payments APIs", description = "Record and fetch member payments")
@RestController
@RequestMapping(path = "/api/v1/payments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final MemberRepository memberRepository;

    private PaymentResponseDto toResponseDto(Payment p) {
    PaymentResponseDto dto = new PaymentResponseDto();
    dto.setId(p.getId());
    dto.setMemberId(p.getMember().getId());
    dto.setAmountPaid(p.getAmountPaid());
    dto.setPaymentDate(p.getPaymentDate());
    dto.setPaymentMethod(p.getPaymentMethod());
    return dto;
    }

    @Operation(summary = "Record payment for member")
    @PostMapping("/member/{memberId}")
    public ResponseEntity<PaymentResponseDto> recordPayment(@PathVariable Long memberId,
                                                            @Valid @RequestBody PaymentRequestDto request) {
        Payment saved = paymentService.recordPayment(memberId, request);
        return new ResponseEntity<>(toResponseDto(saved), HttpStatus.CREATED);
    }

    @Operation(summary = "List payments for member")
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<PaymentResponseDto>> listForMember(@PathVariable Long memberId) {
        List<PaymentResponseDto> list = paymentService.getPaymentsForMember(memberId)
                .stream().map(this::toResponseDto).toList();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "List my payments (self)")
    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponseDto>> listMyPayments(org.springframework.security.core.Authentication authentication) {
    String email = authentication.getName();
    Long memberId = memberRepository.findByEmail(email)
        .map(m -> m.getId())
        .orElseThrow(() -> new com.application.gymflow.exception.member.MemberNotFoundException("Member not found with email: " + email));
    List<Payment> payments = paymentService.getPaymentsForMember(memberId);
        List<PaymentResponseDto> list = payments.stream().map(this::toResponseDto).toList();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "List payments for member between dates")
    @GetMapping("/member/{memberId}/between")
    public ResponseEntity<List<PaymentResponseDto>> listForMemberBetween(@PathVariable Long memberId,
                                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<PaymentResponseDto> list = paymentService.getPaymentsForMemberBetween(memberId, start, end)
                .stream().map(this::toResponseDto).toList();
        return ResponseEntity.ok(list);
    }
}
