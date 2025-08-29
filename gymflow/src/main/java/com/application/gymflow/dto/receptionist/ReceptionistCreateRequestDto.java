package com.application.gymflow.dto.receptionist;

import com.application.gymflow.enums.common.Gender;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.receptionist.Shift;
import com.application.gymflow.model.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionistCreateRequestDto {
    // ==============================
    // Auth Info
    // ==============================
    @Schema(description = "Primary login identifier (unique email)",
            example = "john.doe@gymapp.com", required = true)
    @NotBlank(message = "Email cannot be blank")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Email must be in a valid format like user@example.com"
    )
    private String email;

    @Schema(description = "User password (min 8 chars, must include uppercase, lowercase, number, and special char)",
            example = "Admin@123", required = true)
    @NotBlank(message = "Password cannot be blank")
    private String password;


    // ==============================
    // Personal Info
    // ==============================
    @Schema(description = "User's first name", example = "John", required = true)
    @NotBlank(message = "First name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "First name must contain only letters")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe", required = true)
    @NotBlank(message = "Last name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "Last name must contain only letters")
    private String lastName;

    @Schema(description = "Role assigned to the user", example = "RECEPTIONIST", required = true)
    private Role role;

    @Schema(description = "Current status of the user", example = "ACTIVE", defaultValue = "ACTIVE")
    private Status status = Status.ACTIVE;


    @Schema(description = "Gender of the receptionist", example = "MALE", required = true)
    private Gender gender;

    @Schema(description = "Date of birth of the receptionist", example = "1995-06-15", required = true)
    private LocalDate dateOfBirth;

    // ==============================
    // Address Info
    // ==============================
    @Schema(description = "Address line 1", example = "123 MG Road")
    private String addressLine1;

    @Schema(description = "Address line 2", example = "Near Central Park")
    private String addressLine2;

    @Schema(description = "City of residence", example = "Mumbai")
    private String city;

    @Schema(description = "State of residence", example = "Maharashtra")
    private String state;

    @Schema(description = "Postal code / PIN", example = "400001")
    private String postalCode;

    @Schema(description = "Country of residence", example = "India")
    private String country;

    // ==============================
    // Employment Details
    // ==============================
    @Schema(description = "Date of joining", example = "2024-01-10", required = true)
    private LocalDate dateOfJoining;

    @Schema(description = "Work shift of the receptionist", example = "MORNING", required = true)
    private Shift shift;

    @Schema(description = "Monthly salary of the receptionist", example = "30000", required = true)
    private double salary;

    // ==============================
    // Emergency Contact / Optional Fields
    // ==============================
    @Schema(description = "Emergency contact name", example = "Jane Doe")
    private String emergencyContactName;

    @Schema(description = "Emergency contact phone number", example = "+91-9876543210")
    private String emergencyContactPhone;
}
