package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Core entity representing a complaint raised by a user.
 *
 * Complaint lifecycle:
 *   RAISED → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
 *
 * The "history" field always points to the LATEST StatusHistory entry,
 * giving us quick access to current state without extra queries.
 */
@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintID;

    @Column(nullable = false, length = 200)
    private String title;

    /**
     * columnDefinition = "TEXT" stores up to 65,535 characters.
     * Default VARCHAR(255) is too small for complaint descriptions.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ComplaintStatus status;

    /**
     * @ManyToOne: Many complaints can belong to one user.
     * FetchType.LAZY: User object is NOT loaded until accessed.
     *   → Best practice for performance. EAGER would always JOIN.
     * @JoinColumn: adds a "userID" foreign key column in complaints table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userID", nullable = false)
    private User raisedBy;

    /**
     * Points to the latest/current StatusHistory entry.
     * Allows quick access to: current team, last change time, etc.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historyID")
    private StatusHistory latestHistory;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Enums ──────────────────────────────────────────────────────────────

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum ComplaintStatus {
        RAISED,       // just submitted by user
        IN_PROGRESS,  // assigned to a team by admin
        ESCALATED,    // SLA breached (48h without resolution)
        RESOLVED,     // resolved by admin/team
        CLOSED        // final state, no further action
    }
}
