package com.application.gymflow.dto.user;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.model.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    @Schema(example = "john.doe@gymapp.com")
    private String email;

    @Schema(example = "John")
    private String firstName;

    @Schema(example = "Doe")
    private String lastName;

    private Role.RoleName roleName;

    private Status status;
}
