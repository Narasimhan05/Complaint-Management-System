package com.complaint.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Intercepts every HTTP request and validates the JWT if present.
 *
 * Flow for an authenticated request:
 *   1. Extract "Bearer <token>" from Authorization header
 *   2. Validate the token (signature + expiry)
 *   3. Load the user from DB
 *   4. Set authentication in SecurityContextHolder
 *   5. Continue the filter chain → request reaches the controller
 *
 * OncePerRequestFilter guarantees this runs exactly once per request,
 * even with async dispatch or forward.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No token → skip, Spring Security will reject if the endpoint requires auth
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        // Strip "Bearer " prefix (7 characters)
        String token    = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            log.warn("Invalid JWT token from {}", request.getRemoteAddr());
            chain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.extractUsername(token);

        // Only set auth if not already set in this request
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            var userDetails = userDetailsService.loadUserByUsername(username);

            var authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,                          // credentials (not needed post-auth)
                    userDetails.getAuthorities()   // ["ROLE_USER"] or ["ROLE_ADMIN"]
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // This is the key line — marks the request as authenticated
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        chain.doFilter(request, response);
    }
}
