package com.application.gymflow.dto.payment;

import com.application.gymflow.enums.member.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for recording a payment for a member")
public class PaymentRequestDto {

    @NotNull
    @Positive
    @Schema(description = "Amount paid by the member", example = "750.0")
    private Double amountPaid;

    @Schema(description = "Date of payment; defaults to today if not provided", example = "2025-08-31")
    private LocalDate paymentDate;

    @NotNull
    @Schema(description = "Payment method used", example = "CASH")
    private PaymentMethod paymentMethod;
}
