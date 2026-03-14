package com.complaint.security;

import com.complaint.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Bridges our User entity with Spring Security's UserDetails interface.
 *
 * Spring Security doesn't know about our User class — it only understands
 * UserDetails. This wrapper adapts our User to what Spring Security needs.
 *
 * Key method: getAuthorities() — returns ["ROLE_USER"] or ["ROLE_ADMIN"]
 * The "ROLE_" prefix is REQUIRED by Spring Security for hasRole() checks.
 * hasRole("ADMIN") internally checks for authority "ROLE_ADMIN".
 */
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    /** Expose the underlying User entity for use in services. */
    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
            new SimpleGrantedAuthority("ROLE_" + user.getRoleName().name())
        );
    }

    @Override public String getPassword()              { return user.getPassword(); }
    @Override public String getUsername()              { return user.getUserName(); }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
