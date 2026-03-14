package com.complaint.repository;

import com.complaint.entity.Notification;
import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderBySentAtDesc(User user);
    List<Notification> findByRecipientAndIsReadFalseOrderBySentAtDesc(User user);
    long countByRecipientAndIsReadFalse(User user);
}
