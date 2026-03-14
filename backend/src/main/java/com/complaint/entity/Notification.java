package com.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores all notifications sent to users.
 * Supports IN_APP (bell icon), EMAIL, and SMS types.
 *
 * In development: EMAIL is simulated as console log (app.mail.simulate=true).
 * In production: JavaMailSender sends real emails.
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userID", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaintID")
    private Complaint complaint;   // null for system-wide notifications

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType notificationType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        this.sentAt  = LocalDateTime.now();
        this.isRead  = false;
    }

    public enum NotificationType {
        IN_APP,   // shown in the notification bell
        EMAIL,    // sent via SMTP
        SMS       // future: Twilio / AWS SNS
    }
}
