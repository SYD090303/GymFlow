package com.application.gymflow.controller.user;

import com.application.gymflow.dto.common.ResponseDto;
import com.application.gymflow.dto.user.ChangePasswordRequest;
import com.application.gymflow.dto.user.UpdateProfileRequest;
import com.application.gymflow.dto.user.UserProfileDto;
import com.application.gymflow.dto.user.ChangeEmailRequest;
import com.application.gymflow.model.auth.User;
import com.application.gymflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Settings APIs", description = "Endpoints for users to manage their own profile and password; and admin overrides")
@RestController
@RequestMapping(path = "/api/v1/users", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private UserProfileDto toDto(com.application.gymflow.model.auth.User u) {
        return UserProfileDto.builder()
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .roleName(u.getRole().getRoleName())
                .status(u.getStatus())
                .build();
    }

    // Self: change own password
    @Operation(summary = "Change own password")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/change-password")
    public ResponseEntity<ResponseDto> changeOwnPassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changeOwnPassword(request);
        return ResponseEntity.ok(new ResponseDto("200", "Password changed successfully"));
    }

    // Self: get own profile
    @Operation(summary = "Get own profile")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getOwnProfile() {
        return ResponseEntity.ok(toDto(userService.getOwnProfile()));
    }

    // Self: update own profile
    @Operation(summary = "Update own profile (first/last name)")
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileDto> updateOwnProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateOwnProfile(request);
        return ResponseEntity.ok(toDto(updated));
    }

    // Admin: reset password for any user
    @Operation(summary = "Admin reset password for a user")
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<ResponseDto> adminResetPassword(@PathVariable Long userId, @RequestParam String newPassword) {
        userService.adminResetPassword(userId, newPassword);
        return new ResponseEntity<>(new ResponseDto("200", "Password reset successfully"), HttpStatus.OK);
    }

    // Admin: update profile for any user
    @Operation(summary = "Admin update profile for a user")
    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> adminUpdateProfile(@PathVariable Long userId, @Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.adminUpdateProfile(userId, request);
        return ResponseEntity.ok(toDto(updated));
    }

    // Self: change email and receive a fresh JWT
    @Operation(summary = "Change own email (returns new JWT token)")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/change-email")
    public ResponseEntity<AuthTokenResponse> changeOwnEmail(@Valid @RequestBody ChangeEmailRequest request) {
        String token = userService.changeOwnEmail(request);
        return ResponseEntity.ok(new AuthTokenResponse(token, "Bearer"));
    }

    public record AuthTokenResponse(String accessToken, String tokenType) {}
}
