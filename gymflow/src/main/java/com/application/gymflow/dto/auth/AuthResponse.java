package com.application.gymflow.dto.auth;

import com.application.gymflow.model.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @Schema(description = "JWT authentication token",
            example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIs...")
    private String token;

    @Schema(description = "Token type, usually 'Bearer'", example = "Bearer")
    private String type;

    @Schema(description = "Authenticated user's email", example = "admin@gymapp.com")
    private String email;

    @Schema(description = "Authenticated user's first name", example = "John")
    private String firstName;

    @Schema(description = "Role assigned to the user", example = "ADMIN")
    private Role.RoleName role;
}
