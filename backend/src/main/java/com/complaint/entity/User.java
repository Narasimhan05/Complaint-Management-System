package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Represents a system user — can be a regular USER or ADMIN.
 *
 * Interview note: @Entity maps this class to the "users" table.
 * JPA creates the table automatically when ddl-auto=update.
 */
@Entity
@Table(name = "users",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "userName"),
        @UniqueConstraint(columnNames = "email")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "password")  // never log passwords
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;

    @Column(nullable = false, length = 50)
    private String userName;

    /**
     * EnumType.STRING stores "USER" or "ADMIN" as text.
     * EnumType.ORDINAL (default) stores 0 or 1 — risky if enum order changes.
     * Always use STRING in production.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleName roleName;

    @Column(nullable = false)
    private String password;   // stored as BCrypt hash, never plaintext

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * @PrePersist runs automatically before the first INSERT.
     * This is a JPA lifecycle callback — no need to set createdAt manually.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum RoleName {
        USER,   // can raise and track own complaints
        ADMIN   // can assign, update status, manage teams
    }
}
