package com.application.gymflow.dto.member;

import com.application.gymflow.enums.member.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO for creating a new member, including their personal, membership, and fitness details.")
public class MemberRequestDto {

    @NotBlank(message = "Email cannot be blank")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Email must be in a valid format like user@example.com"
    )
    @Schema(description = "Member's unique email address", example = "john.doe@example.com", required = true)
    private String email;

    @NotBlank(message = "First name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "First name must contain only letters")
    @Schema(description = "Member's first name", example = "John", required = true)
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "Last name must contain only letters")
    @Schema(description = "Member's last name", example = "Doe", required = true)
    private String lastName;


    @Schema(description = "User password (min 8 chars, must include uppercase, lowercase, number, and special char)",
            example = "Admin@123", required = true)
    @NotBlank(message = "Password cannot be blank")
    private String password;

    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must be exactly 10 digits"
    )
    @Schema(description = "Member's 10-digit phone number", example = "9876543210")
    private String phone;

    // Membership Plan ID
    @NotNull(message = "Membership plan ID is required")
    @Schema(description = "The ID of the membership plan the member is enrolling in", example = "1", required = true)
    private Long membershipPlanId;

    @NotNull(message = "Start date cannot be null")
    @Schema(description = "The start date of the member's subscription", example = "2025-08-26", required = true)
    private LocalDate startDate;

    @Schema(description = "Whether the membership should automatically renew", example = "true")
    private boolean autoRenew;

    // Financial Info
    @NotNull(message = "Amount paid cannot be null")
    @Positive(message = "Amount paid must be a positive number")
    @Schema(description = "The amount paid for the membership", example = "50.00", required = true)
    private Double amountPaid;

    @NotNull(message = "Payment method cannot be null")
    @Schema(description = "The payment method used for the transaction", example = "CREDIT_CARD", required = true)
    private PaymentMethod paymentMethod;

    // Fitness Metrics
    @NotNull(message = "Height cannot be null")
    @DecimalMin("50.0")
    @DecimalMax("250.0")
    @Schema(description = "Member's height in cm", example = "175.5", required = true, minimum = "50.0", maximum = "250.0")
    private Double height;

    @NotNull(message = "Weight cannot be null")
    @DecimalMin("20.0")
    @DecimalMax("300.0")
    @Schema(description = "Member's weight in kg", example = "70.2", required = true, minimum = "20.0", maximum = "300.0")
    private Double weight;

    @Schema(description = "Any existing medical conditions of the member", example = "Hypertension")
    private String medicalConditions;

    @Schema(description = "Any past or current injuries of the member", example = "Knee injury from running")
    private String injuries;

    @Schema(description = "Any known allergies of the member", example = "Pollen, Peanuts")
    private String allergies;
}