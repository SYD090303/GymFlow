package com.application.gymflow.model.auth;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.model.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Schema(description = "Primary login identifier (unique email)",
            example = "john.doe@gymapp.com", required = true)
    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email cannot be blank")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Email must be in a valid format like user@example.com"
    )
    private String email;

    @Schema(description = "Encrypted user password (min 8 chars, must include uppercase, lowercase, number, and special char)",
            example = "Admin@123", required = true)
    @NotBlank(message = "Password cannot be blank")
    @Column(nullable = false)
    private String password;

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


    @Schema(description = "Role assigned to the user", example = "ADMIN")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Schema(description = "Current status of the user", example = "ACTIVE")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.ACTIVE;
}
