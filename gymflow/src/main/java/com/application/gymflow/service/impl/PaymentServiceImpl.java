package com.application.gymflow.service.impl;

import com.application.gymflow.dto.payment.PaymentRequestDto;
import com.application.gymflow.exception.member.MemberNotFoundException;
import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.Payment;
import com.application.gymflow.repository.member.MemberRepository;
import com.application.gymflow.repository.member.PaymentRepository;
import com.application.gymflow.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with ID: " + memberId));
    }

    @Override
    @Transactional
    public Payment recordPayment(Long memberId, PaymentRequestDto request) {
        Member member = getMemberOrThrow(memberId);
    Payment payment = new Payment();
    payment.setMember(member);
    payment.setAmountPaid(request.getAmountPaid());
    payment.setPaymentMethod(request.getPaymentMethod());
    payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getPaymentsForMember(Long memberId) {
        Member member = getMemberOrThrow(memberId);
        return paymentRepository.findByMemberOrderByPaymentDateDesc(member);
    }

    @Override
    public List<Payment> getPaymentsForMemberBetween(Long memberId, LocalDate start, LocalDate end) {
        Member member = getMemberOrThrow(memberId);
        return paymentRepository.findByMemberAndPaymentDateBetween(member, start, end);
    }
}
