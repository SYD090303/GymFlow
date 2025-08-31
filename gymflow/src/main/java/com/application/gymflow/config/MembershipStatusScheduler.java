package com.application.gymflow.config;

import com.application.gymflow.dto.jobs.SyncResultDto;
import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.model.member.Membership;
import com.application.gymflow.model.notification.Notification;
import com.application.gymflow.service.NotificationService;
import com.application.gymflow.repository.member.MembershipRepository;
import com.application.gymflow.repository.notification.NotificationRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MembershipStatusScheduler {

    private final MembershipRepository membershipRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    // Default: Run daily at 00:10. Override via property app.jobs.membership-status-cron
    @Scheduled(cron = "${app.jobs.membership-status-cron:0 10 0 * * *}")
    public void syncStatusesDaily() {
        runSync(true);
    }

    public SyncResultDto runSync(boolean persistNotification) {
        List<Membership> memberships = membershipRepository.findAll();
        if (memberships.isEmpty()) {
            if (persistNotification) {
                notificationService.createOwnerNotification("Membership status sync", "No memberships found. Scheduler ran with no work to do.");
            }
            return SyncResultDto.builder()
                    .updates(0)
                    .toActive(0)
                    .toExpired(0)
                    .toPending(0)
                    .message("No memberships found.")
                    .build();
        }
        LocalDate today = LocalDate.now();
        int updates = 0;
        int toActive = 0, toExpired = 0, toPending = 0;
        for (Membership m : memberships) {
            MembershipStatus before = m.getMembershipStatus();
            if (before == MembershipStatus.CANCELLED) continue; // preserve business intent
            MembershipStatus after;
            if (m.getStartDate() != null && m.getStartDate().isAfter(today)) {
                after = MembershipStatus.PENDING;
            } else if (m.getEndDate() != null && m.getEndDate().isBefore(today)) {
                after = MembershipStatus.EXPIRED;
            } else {
                after = MembershipStatus.ACTIVE;
            }
            if (after != before) {
                m.setMembershipStatus(after);
                updates++;
                if (after == MembershipStatus.ACTIVE) toActive++;
                else if (after == MembershipStatus.EXPIRED) toExpired++;
                else if (after == MembershipStatus.PENDING) toPending++;
            }
        }
        String message;
        if (updates > 0) {
            membershipRepository.saveAll(memberships);
            message = String.format("Updated %d memberships. ACTIVE=%d, EXPIRED=%d, PENDING=%d", updates, toActive, toExpired, toPending);
            log.info("Membership status sync: {} updated (active={}, expired={}, pending={})", updates, toActive, toExpired, toPending);
        } else {
            message = "No status changes today.";
            log.info("Membership status sync: no updates");
        }
        if (persistNotification) {
            notificationService.createOwnerNotification("Membership status sync completed", message);
        }
        return SyncResultDto.builder()
                .updates(updates)
                .toActive(toActive)
                .toExpired(toExpired)
                .toPending(toPending)
                .message(message)
                .build();
    }
}
