package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Records every time a complaint is assigned or re-assigned to a team.
 * Provides full assignment history for auditing.
 */
@Entity
@Table(name = "complaint_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaintID", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teamID", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignedByUserID", nullable = false)
    private User assignedBy;   // the admin who made this assignment

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status;

    @Column(length = 500)
    private String notes;   // optional admin notes on assignment

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum AssignmentStatus {
        ASSIGNED,       // initial assignment
        REASSIGNED,     // moved to another team
        COMPLETED       // team marked as done
    }
}
