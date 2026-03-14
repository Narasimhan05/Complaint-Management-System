package com.complaint.controller;

import com.complaint.entity.Notification;
import com.complaint.entity.User;
import com.complaint.security.CustomUserDetails;
import com.complaint.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "4. Notifications", description = "Notification bell — works for both USER and ADMIN")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications for current user")
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAllForUser(currentUser()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count — used for bell badge")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        long count = notificationService.getUnreadCount(currentUser());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark one notification as read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllAsRead(currentUser());
        return ResponseEntity.noContent().build();
    }

    private User currentUser() {
        var principal = (CustomUserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser();
    }
}
