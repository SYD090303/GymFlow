package com.application.gymflow.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeEmailRequest {
    @Schema(description = "Current password for verification", example = "OldPass@123")
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @Schema(description = "New email to assign", example = "new.email@gymapp.com")
    @NotBlank(message = "New email is required")
    @Email(message = "New email must be valid")
    private String newEmail;
}
