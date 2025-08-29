package com.application.gymflow.model.receptionist;

import com.application.gymflow.enums.common.Gender;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.receptionist.Shift;
import com.application.gymflow.model.BaseEntity;
import com.application.gymflow.model.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "receptionists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receptionist extends BaseEntity {


    private static final String IMAGE_FILE_STORAGE = "./img-photos";

    @Schema(description = "Primary login identifier (unique email)",
            example = "john.doe@gymapp.com", required = true)
    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email cannot be blank")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Email must be in a valid format like user@example.com"
    )
    private String email;

    @Schema(description = "User's first name", example = "John", required = true)
    @Column(nullable = false, length = 50)
    @NotBlank(message = "First name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "First name must contain only letters")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe", required = true)
    @Column(nullable = false, length = 50)
    @NotBlank(message = "Last name cannot be blank")
    @Pattern(regexp = "^[A-Za-z]+$", message = "Last name must contain only letters")
    private String lastName;

    @Schema(description = "Current status of the user", example = "ACTIVE")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.ACTIVE;

    @Schema(example = "https://example.com/profile.jpg", description = "Profile picture URL")
    private String profilePictureUrl;

    // ==============================
    // Personal Info
    // ==============================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    // ==============================
    // Address Info
    // ==============================
    @Column(length = 255)
    private String addressLine1;

    @Column(length = 255)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    // ==============================
    // Employment Details
    // ==============================
    @Column(nullable = false)
    private LocalDate dateOfJoining;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Shift shift;

    // ==============================
    // HR & Leave Details
    // ==============================
    @Column(nullable = false)
    private double salary;

    // ==============================
    // Emergency Contact / Optional Fields
    // ==============================
    @Column(length = 100)
    private String emergencyContactName;

    @Column(length = 15)
    private String emergencyContactPhone;
}
