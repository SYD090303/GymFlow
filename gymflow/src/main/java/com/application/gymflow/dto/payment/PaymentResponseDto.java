package com.application.gymflow.dto.payment;

import com.application.gymflow.enums.member.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO representing a member payment")
public class PaymentResponseDto {
    private Long id;
    private Long memberId;
    private Double amountPaid;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
}
