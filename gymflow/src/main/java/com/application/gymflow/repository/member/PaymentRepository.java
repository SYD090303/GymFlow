package com.application.gymflow.repository.member;

import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByMember(Member member);
    List<Payment> findByMemberOrderByPaymentDateDesc(Member member);
    List<Payment> findByMemberAndPaymentDateBetween(Member member, LocalDate startDate, LocalDate endDate);
}