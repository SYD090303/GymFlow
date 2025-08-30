package com.application.gymflow.dto.receptionist;

import com.application.gymflow.enums.common.Gender;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.receptionist.Shift;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO for updating an existing Receptionist. All fields are optional.
 * Password and email are intentionally excluded; use dedicated endpoints to change them.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionistUpdateRequestDto {
    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "Current status of the user", example = "ACTIVE")
    private Status status;

    @Schema(description = "Gender of the receptionist", example = "MALE")
    private Gender gender;

    @Schema(description = "Date of birth of the receptionist", example = "1995-06-15")
    private LocalDate dateOfBirth;

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

    @Schema(description = "Date of joining", example = "2024-01-10")
    private LocalDate dateOfJoining;

    @Schema(description = "Work shift of the receptionist", example = "MORNING")
    private Shift shift;

    @Schema(description = "Monthly salary of the receptionist", example = "30000")
    private Double salary;

    @Schema(description = "Emergency contact name", example = "Jane Doe")
    private String emergencyContactName;

    @Schema(description = "Emergency contact phone number", example = "+91-9876543210")
    private String emergencyContactPhone;
}
