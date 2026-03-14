package com.complaint.service;

import com.complaint.dto.request.LoginRequest;
import com.complaint.dto.request.RegisterRequest;
import com.complaint.dto.response.AuthResponse;
import com.complaint.entity.User;
import com.complaint.repository.UserRepository;
import com.complaint.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil             jwtUtil;
    private final NotificationService notificationService;

    /**
     * Registers a new user.
     * Steps:
     *   1. Check username/email not already taken
     *   2. BCrypt hash the password
     *   3. Save user to DB
     *   4. Send welcome notification
     *   5. Return JWT so user is immediately logged in
     */
    @Transactional
    public AuthResponse register(RegisterRequest req) {

        if (userRepository.existsByUserName(req.getUserName()))
            throw new RuntimeException("Username '" + req.getUserName() + "' is already taken");

        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email '" + req.getEmail() + "' is already registered");

        var user = User.builder()
                .userName(req.getUserName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))  // NEVER store plaintext
                .phone(req.getPhone())
                .roleName(req.getRoleName() != null ? req.getRoleName() : User.RoleName.USER)
                .build();

        userRepository.save(user);
        log.info("New user registered: {} ({})", user.getUserName(), user.getRoleName());

        // Welcome notification
        notificationService.createInAppNotification(
            user, null,
            "🎉 Welcome to Complaint Management System, " + user.getUserName() + "!");

        return buildAuthResponse(user);
    }

    /**
     * Authenticates a user and returns a JWT.
     *
     * authManager.authenticate() internally:
     *   1. Calls loadUserByUsername(username)
     *   2. Compares provided password with BCrypt hash
     *   3. Throws BadCredentialsException if wrong
     */
    public AuthResponse login(LoginRequest req) {

        // This throws AuthenticationException if credentials are wrong
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUserName(), req.getPassword())
        );

        var user = userRepository.findByUserName(req.getUserName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("User logged in: {}", user.getUserName());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user.getUserName()))
                .userName(user.getUserName())
                .roleName(user.getRoleName().name())
                .userId(user.getUserID())
                .email(user.getEmail())
                .build();
    }
}
