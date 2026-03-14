package com.complaint.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Handles all JWT operations.
 *
 * JWT structure: header.payload.signature
 *   header    → {"alg":"HS256","typ":"JWT"}
 *   payload   → {"sub":"username","iat":...,"exp":...}
 *   signature → HMAC-SHA256(base64(header) + "." + base64(payload), secret)
 *
 * The signature ensures no one can tamper with the payload.
 * The server verifies signature on EVERY request — no DB lookup needed.
 * That's what makes JWT "stateless".
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expirationMs;   // 86400000 = 24 hours

    /**
     * Creates an HMAC-SHA256 signing key from the secret string.
     * The secret must be at least 256 bits (32 characters) for HS256.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generates a JWT for the given username.
     * Called once at login — the token is sent to the frontend.
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the username from the token payload.
     * Called on every authenticated request.
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Returns true if the token is valid and not expired.
     * Invalid = tampered, expired, or malformed.
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
