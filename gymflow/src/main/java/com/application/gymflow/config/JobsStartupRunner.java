package com.application.gymflow.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobsStartupRunner implements ApplicationRunner {

    private final MembershipStatusScheduler membershipStatusScheduler;

    @Value("${app.jobs.run-on-startup:true}")
    private boolean runOnStartup;

    @Override
    public void run(ApplicationArguments args) {
        if (!runOnStartup) {
            log.info("Startup jobs disabled via app.jobs.run-on-startup=false");
            return;
        }
        try {
            log.info("Running membership status sync on startup...");
            membershipStatusScheduler.syncStatusesDaily();
            log.info("Startup membership status sync finished.");
        } catch (Exception ex) {
            log.warn("Startup membership status sync failed: {}", ex.getMessage());
        }
    }
}
