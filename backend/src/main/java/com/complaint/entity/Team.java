package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a support team that handles complaints.
 * Examples: "IT Support", "HR", "Facilities Management"
 */
@Entity
@Table(name = "teams",
    uniqueConstraints = @UniqueConstraint(columnNames = "teamName"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(nullable = false, length = 100)
    private String teamName;

    @Column(length = 200)
    private String description;

    @Column(length = 100)
    private String contactEmail;

    /**
     * Optional: who leads this team.
     * This user receives escalation notifications.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teamLeadUserID")
    private User teamLead;
}
