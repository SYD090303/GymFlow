package com.application.gymflow.service;

import com.application.gymflow.dto.payment.PaymentRequestDto;
import com.application.gymflow.model.member.Payment;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {
    Payment recordPayment(Long memberId, PaymentRequestDto request);
    List<Payment> getPaymentsForMember(Long memberId);
    List<Payment> getPaymentsForMemberBetween(Long memberId, LocalDate start, LocalDate end);
}
