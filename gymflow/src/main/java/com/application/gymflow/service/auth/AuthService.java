package com.application.gymflow.service.auth;

import com.application.gymflow.constants.AuthConstants;
import com.application.gymflow.dto.auth.AuthRequest;
import com.application.gymflow.dto.auth.AuthResponse;
import com.application.gymflow.dto.auth.RegisterRequest;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.exception.user.DuplicateUserException;
import com.application.gymflow.exception.user.InactiveUserException;
import com.application.gymflow.exception.user.InvalidCredentialsException;
import com.application.gymflow.exception.user.UserNotFoundException;
import com.application.gymflow.model.auth.Role;
import com.application.gymflow.model.auth.User;
import com.application.gymflow.repository.auth.RoleRepository;
import com.application.gymflow.repository.auth.UserRepository;
import com.application.gymflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final String USER_IMAGE_FILE_STORAGE = "./user-photos";

    // --------------------- LOGIN ---------------------
    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new InvalidCredentialsException(AuthConstants.MESSAGE_401_INVALID);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with Email " + request.getEmail()));

        if (user.getStatus() != Status.ACTIVE) {
            throw new InactiveUserException(AuthConstants.MESSAGE_403_INACTIVE);
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().getRoleName().name(), "uid", user.getId())
        );

        return new AuthResponse(token, "Bearer", user.getEmail(), user.getFirstName(), user.getRole().getRoleName());
    }

    // --------------------- CREATE USER ---------------------
    public User createUser(RegisterRequest request) {
        // Check if user already exists
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new DuplicateUserException("User already exists with email: " + request.getEmail());
        });

        // Fetch role
        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + request.getRoleName()));

        // Build user entity
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .status(request.getStatus() != null ? request.getStatus() : Status.ACTIVE)
                .build();

        return userRepository.save(user);
    }

}
