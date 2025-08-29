package com.application.gymflow.config;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.model.auth.Role;
import com.application.gymflow.model.auth.User;
import com.application.gymflow.repository.auth.RoleRepository;
import com.application.gymflow.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        List<Role> roles = Arrays.asList(
                Role.builder()
                        .roleName(Role.RoleName.OWNER)
                        .description("Owner of the gym, has full system access and manages overall operations.")
                        .build(),
                Role.builder()
                        .roleName(Role.RoleName.RECEPTIONIST)
                        .description("Handles front desk operations, member registrations, payments, and scheduling.")
                        .build(),
                Role.builder()
                        .roleName(Role.RoleName.TRAINER)
                        .description("Guides members with workouts, fitness plans, and training sessions.")
                        .build(),
                Role.builder()
                        .roleName(Role.RoleName.MEMBER)
                        .description("Regular gym member with access to gym facilities and training sessions.")
                        .build()
        );

        for (Role role : roles) {
            roleRepository.findByRoleName(role.getRoleName())
                    .orElseGet(() -> roleRepository.save(role));
        }
    }

    private void initializeAdminUser() {
        String adminEmail = "owner@gymapp.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role ownerRole = roleRepository.findByRoleName(Role.RoleName.OWNER)
                    .orElseThrow(() -> new RuntimeException("OWNER role not found"));

            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Owner@123")) // encrypted
                    .firstName("System")
                    .lastName("Owner")
                    .role(ownerRole)
                    .status(Status.ACTIVE)
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Default OWNER user created: " + adminEmail);
        }
    }
}
