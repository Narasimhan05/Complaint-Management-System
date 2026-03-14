package com.complaint.security;

import com.complaint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Tells Spring Security HOW to load a user from the database.
 *
 * Spring Security calls loadUserByUsername() automatically during:
 *   1. Login: to get the user and compare passwords
 *   2. JWT filter: to get user details after token validation
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUserName(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found: " + username));

        return new CustomUserDetails(user);
    }
}
