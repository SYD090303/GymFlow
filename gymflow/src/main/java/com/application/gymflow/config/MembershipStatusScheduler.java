package com.application.gymflow.config;

import com.application.gymflow.enums.member.MembershipStatus;
import com.application.gymflow.model.member.Membership;
import com.application.gymflow.repository.member.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MembershipStatusScheduler {

    private final MembershipRepository membershipRepository;

    // Run daily at 00:10
    @Scheduled(cron = "0 10 0 * * *")
    public void syncStatusesDaily() {
        List<Membership> memberships = membershipRepository.findAll();
        if (memberships.isEmpty()) return;
        LocalDate today = LocalDate.now();
        int updates = 0;
        for (Membership m : memberships) {
            MembershipStatus before = m.getMembershipStatus();
            if (before == MembershipStatus.CANCELLED) continue; // preserve business intent
            MembershipStatus after = before;
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
            }
        }
        if (updates > 0) {
            membershipRepository.saveAll(memberships);
            log.info("Membership status sync: {} updated", updates);
        }
    }
}
