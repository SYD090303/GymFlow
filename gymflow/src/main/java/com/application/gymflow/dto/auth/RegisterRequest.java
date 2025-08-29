package com.application.gymflow.dto.auth;

import com.application.gymflow.model.auth.Role;
import com.application.gymflow.enums.common.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @Schema(example = "john.doe@gymapp.com")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    private String email;

    @Schema(example = "Admin@123")
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @Schema(example = "John")
    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @Schema(example = "Doe")
    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    @Schema(example = "MEMBER")
    @NotNull(message = "Role must be provided")
    private Role.RoleName roleName;

    @Schema(example = "ACTIVE")
    private Status status = Status.ACTIVE; // optional (defaults to ACTIVE)
}
