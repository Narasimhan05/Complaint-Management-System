package com.complaint.service;

import com.complaint.entity.Complaint;
import com.complaint.entity.Notification;
import com.complaint.entity.User;
import com.complaint.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final JavaMailSender         mailSender;

    @Value("${app.mail.simulate:true}")
    private boolean simulateMail;

    // ── Create in-app notification ────────────────────────────────────────

    public Notification createInAppNotification(User recipient, Complaint complaint,
                                                 String message) {
        var notification = Notification.builder()
                .recipient(recipient)
                .complaint(complaint)
                .notificationType(Notification.NotificationType.IN_APP)
                .message(message)
                .build();
        return notificationRepo.save(notification);
    }

    // ── Send email notification (real or simulated) ───────────────────────

    public void sendEmailNotification(User recipient, Complaint complaint,
                                       String subject, String body) {
        // Always save to DB so it shows in notification bell
        var notification = Notification.builder()
                .recipient(recipient)
                .complaint(complaint)
                .notificationType(Notification.NotificationType.EMAIL)
                .message(body)
                .build();
        notificationRepo.save(notification);

        if (simulateMail) {
            // Dev mode: log instead of sending
            log.info("📧 [SIMULATED EMAIL] To: {} | Subject: {} | Body: {}",
                     recipient.getEmail(), subject, body);
            return;
        }

        // Production: real email via SMTP
        try {
            var mail = new SimpleMailMessage();
            mail.setTo(recipient.getEmail());
            mail.setSubject(subject);
            mail.setText(body);
            mailSender.send(mail);
            log.info("Email sent to {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipient.getEmail(), e.getMessage());
            // Don't rethrow — email failure should never break the main flow
        }
    }

    // ── Queries ───────────────────────────────────────────────────────────

    public List<Notification> getAllForUser(User user) {
        return notificationRepo.findByRecipientOrderBySentAtDesc(user);
    }

    public List<Notification> getUnreadForUser(User user) {
        return notificationRepo.findByRecipientAndIsReadFalseOrderBySentAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepo.countByRecipientAndIsReadFalse(user);
    }

    public void markAsRead(Long notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepo.save(n);
        });
    }

    public void markAllAsRead(User user) {
        var unread = notificationRepo.findByRecipientAndIsReadFalseOrderBySentAtDesc(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(unread);
    }
}
