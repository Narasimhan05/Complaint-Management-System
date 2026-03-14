package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Tracks every status change for a complaint — a full audit trail.
 *
 * Example for complaint #5:
 *   1. null → RAISED        (user raised it)
 *   2. RAISED → IN_PROGRESS (admin assigned)
 *   3. IN_PROGRESS → ESCALATED (SLA breached, auto by scheduler)
 *   4. ESCALATED → RESOLVED (admin resolved)
 *
 * activeFlag = true means this is the CURRENT/latest entry for the complaint.
 * Previous entries have activeFlag = false (historical record).
 */
@Entity
@Table(name = "status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaintID", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changedByUserID")
    private User changedBy;   // null when auto-escalated by scheduler

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teamID")
    private Team team;        // set when complaint is assigned to a team

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Complaint.ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Complaint.ComplaintStatus newStatus;

    private LocalDateTime escalationTime;   // set when status = ESCALATED
    private LocalDateTime resolutionTime;   // set when status = RESOLVED

    /**
     * true  = this is the current status entry for this complaint
     * false = historical entry (old status, kept for audit trail)
     */
    @Column(nullable = false)
    private Boolean activeFlag;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
