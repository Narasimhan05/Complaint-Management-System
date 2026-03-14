// ─────────────────────────────────────────────────────────────────
// dto/request/RegisterRequest.java
// ─────────────────────────────────────────────────────────────────
package com.complaint.dto.request;

import com.complaint.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO = Data Transfer Object.
 * Used to receive request body from the frontend.
 *
 * Why DTOs instead of Entity classes directly?
 *   1. Never expose internal fields (e.g., password hash, internal IDs)
 *   2. Input validation lives here, not in the entity
 *   3. API contract is decoupled from DB schema
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    private String userName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    // Default to USER if not provided
    private User.RoleName roleName = User.RoleName.USER;
}
