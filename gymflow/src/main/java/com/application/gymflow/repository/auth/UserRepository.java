package com.application.gymflow.repository.auth;

import com.application.gymflow.model.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing {@link User} entities.
 * <p>
 * Extends {@link JpaRepository} to provide standard CRUD operations,
 * pagination, and query execution for the User entity.
 * </p>
 *
 * <p>
 * Custom query methods are defined here following Spring Data JPA
 * method naming conventions.
 * </p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Checks if a user exists with the given email.
     *
     * @param email The email to check (case-sensitive).
     * @return {@code true} if a user exists with the given email, otherwise {@code false}.
     */
    boolean existsByEmail(String email);


    /**
     * Finds a user by email.
     *
     * @param email The email of the user to search for.
     * @return An {@link Optional} containing the {@link User} if found, otherwise empty.
     */
    Optional<User> findByEmail(String email);
}
