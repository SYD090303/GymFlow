package com.application.gymflow.controller.jobs;

import com.application.gymflow.config.MembershipStatusScheduler;
import com.application.gymflow.dto.jobs.SyncResultDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs")
public class JobsController {

    private final MembershipStatusScheduler membershipStatusScheduler;

    @PostMapping("/membership-status/sync")
    public ResponseEntity<SyncResultDto> triggerMembershipSync() {
        SyncResultDto result = membershipStatusScheduler.runSync(true);
        return ResponseEntity.ok(result);
    }
}
