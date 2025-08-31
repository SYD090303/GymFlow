package com.application.gymflow.controller.notification;

import com.application.gymflow.dto.notification.NotificationResponseDto;
import com.application.gymflow.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // Owner dashboard pulls top 20 notifications
    @GetMapping("/owner")
    public ResponseEntity<List<NotificationResponseDto>> getOwnerNotifications() {
        return ResponseEntity.ok(notificationService.getOwnerNotifications());
    }

    // Generic endpoint for current user (OWNER/RECEPTIONIST supported)
    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    // Optional: mark all unread as read for owner
    @PutMapping("/owner/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.getOwnerNotifications().forEach(n -> notificationService.markAsRead(n.getId()));
        return ResponseEntity.noContent().build();
    }
}
