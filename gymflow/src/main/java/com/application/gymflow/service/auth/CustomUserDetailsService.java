package com.application.gymflow.service.auth;

import com.application.gymflow.model.auth.User;
import com.application.gymflow.repository.auth.UserRepository;
import com.application.gymflow.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom implementation of {@link UserDetailsService} for Spring Security.
 * <p>
 * This service loads user-specific data during authentication.
 * It retrieves a {@link User} entity from the database using the
 * provided email and wraps it into a {@link SecurityUser} object
 * which implements {@link UserDetails}.
 * </p>
 *
 * <p>
 * Spring Security uses this class automatically when configured in
 * {@code SecurityConfig}.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads the user details by their email (used as the username).
     *
     * @param email The email of the user attempting to authenticate.
     * @return {@link SecurityUser} object containing user details for authentication.
     * @throws UsernameNotFoundException if no user is found with the provided email.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new SecurityUser(user);
    }
}
