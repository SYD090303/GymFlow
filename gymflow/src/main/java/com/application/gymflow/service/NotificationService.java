package com.application.gymflow.service;

import com.application.gymflow.dto.notification.NotificationResponseDto;
import com.application.gymflow.model.notification.Notification;
import com.application.gymflow.repository.notification.NotificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<NotificationResponseDto> getOwnerNotifications() {
    return notificationRepository
        .findTop20ByAudienceAndReadFlagFalseOrderByCreatedAtDesc(Notification.Audience.OWNER)
                .stream()
                .filter(n -> n.getTitle() == null || !n.getTitle().toLowerCase().contains("status sync"))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<NotificationResponseDto> getMyNotifications(Authentication auth) {
        boolean isOwner = hasRole(auth, "ROLE_OWNER");
        if (!isOwner) return List.of();
    return notificationRepository
        .findTop20ByAudienceAndReadFlagFalseOrderByCreatedAtDesc(Notification.Audience.OWNER)
                .stream()
                .filter(n -> n.getTitle() == null || !n.getTitle().toLowerCase().contains("status sync"))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (role.equals(ga.getAuthority())) return true;
        }
        return false;
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setReadFlag(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public Notification createOwnerNotification(String title, String message) {
        Notification n = Notification.builder()
                .title(title)
                .message(message)
                .audience(Notification.Audience.OWNER)
                .build();
        return notificationRepository.save(n);
    }

    // Receptionist notifications removed; owner-only

    private NotificationResponseDto toDto(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .audience(n.getAudience().name())
                .read(n.isReadFlag())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
