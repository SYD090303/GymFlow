package com.application.gymflow.security;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.model.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapter class that converts a domain {@link User} entity
 * into a Spring Security {@link UserDetails} implementation.
 * <p>
 * This allows Spring Security to use custom User objects
 * for authentication and authorization.
 * </p>
 */
@RequiredArgsConstructor
public class SecurityUser implements UserDetails {

    private final User user;

    /**
     * Returns user authorities. Spring requires ROLE_ prefix.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = "ROLE_" + user.getRole().getRoleName().name();
        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // using email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // not tracking account expiry
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() != Status.BANNED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // not tracking credential expiry
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == Status.ACTIVE;
    }

    /**
     * Exposes the wrapped domain {@link User}.
     *
     * @return The User entity.
     */
    public User getDomainUser() {
        return user;
    }
}
