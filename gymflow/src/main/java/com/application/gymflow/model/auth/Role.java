package com.application.gymflow.model.auth;

import jakarta.persistence.*;
import lombok.*;

/**
 * Role entity defining system roles: OWNER, RECEPTIONIST, TRAINER, MEMBER
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleName roleName;

    @Column(length = 255)
    private String description;

    public enum RoleName {
        OWNER, RECEPTIONIST, TRAINER, MEMBER
    }
}