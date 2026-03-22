package com.complaint.config;

import com.complaint.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Central Spring Security configuration.
 *
 * Interview talking points:
 *   - STATELESS sessions: no HttpSession created (JWT handles state)
 *   - CSRF disabled: safe for stateless REST APIs (CSRF attacks need cookies/sessions)
 *   - CORS configured: allows React on :3000 to call Spring on :8080
 *   - BCrypt: adaptive hashing algorithm, slows down brute force attacks
 *   - @EnableMethodSecurity: enables @PreAuthorize on controller methods
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF: safe for stateless REST (no cookies, no session)
            .csrf(csrf -> csrf.disable())

            // CORS: allow our React frontend
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless: no HttpSession, every request must carry a JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // URL authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                 "/api-docs/**", "/v3/api-docs/**").permitAll()

                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // Insert JWT filter BEFORE Spring's default login filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "https://complaint-management-system-arph.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * BCrypt: hashes passwords with a random salt.
     * Strength 10 means 2^10 = 1024 hashing rounds.
     * Higher = slower for attackers, but also slower for users.
     * 10 is the industry-standard balance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * Spring uses this to authenticate username+password during login.
     * It internally calls CustomUserDetailsService.loadUserByUsername()
     * and compares the provided password with the BCrypt hash.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
