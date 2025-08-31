package com.application.gymflow.service;

import com.application.gymflow.dto.user.ChangePasswordRequest;
import com.application.gymflow.dto.user.ChangeEmailRequest;
import com.application.gymflow.dto.user.UpdateProfileRequest;
import com.application.gymflow.exception.user.UserNotFoundException;
import com.application.gymflow.model.auth.User;
import com.application.gymflow.repository.auth.UserRepository;
import com.application.gymflow.repository.member.MemberRepository;
import com.application.gymflow.repository.receptionist.ReceptionistRepository;
import com.application.gymflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final ReceptionistRepository receptionistRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found: " + email));
    }

    public User getOwnProfile() {
        return getAuthenticatedUser();
    }

    // Self-service: change password
    @Transactional
    public void changeOwnPassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Self-service: update own profile
    @Transactional
    public User updateOwnProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        return userRepository.save(user);
    }

    // Self-service: change own email (returns new JWT)
    @Transactional
    public String changeOwnEmail(ChangeEmailRequest request) {
        User user = getAuthenticatedUser();
        // Verify password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        String newEmail = request.getNewEmail().trim();
        if (newEmail.equalsIgnoreCase(user.getEmail())) {
            return jwtUtil.generateToken(user.getEmail(), java.util.Map.of("role", user.getRole().getRoleName().name(), "uid", user.getId()));
        }
        // Uniqueness across user/member/receptionist
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already used by another user");
        }
        if (memberRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already used by a member");
        }
        if (receptionistRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already used by a receptionist");
        }

        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        userRepository.save(user);

        // Sync linked aggregates if they exist
        memberRepository.findByEmail(oldEmail).ifPresent(m -> { m.setEmail(newEmail); memberRepository.save(m); });
        receptionistRepository.findByEmail(oldEmail).ifPresent(r -> { r.setEmail(newEmail); receptionistRepository.save(r); });

        // Issue fresh token bound to new email
        return jwtUtil.generateToken(newEmail, java.util.Map.of("role", user.getRole().getRoleName().name(), "uid", user.getId()));
    }

    // Admin: reset password for a user by id
    @Transactional
    public void adminResetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Admin: update basic profile for a user by id
    @Transactional
    public User adminUpdateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        return userRepository.save(user);
    }
}
