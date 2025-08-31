package com.application.gymflow.service;


import com.application.gymflow.enums.member.RecordedByType;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.repository.member.AttendanceLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
public class AttendanceLogService {

    @Autowired
    private AttendanceLogRepository attendanceLogRepository;

    @Autowired
    private NotificationService notificationService;

    public AttendanceLog saveAttendanceLog(AttendanceLog attendanceLog) {
        // Get the current user's authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Determine the RecordedByType based on the user's role
        // This is a simplified example. You would likely use roles from your UserDetails.
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            // Logic to determine if it's STAFF or RECEPTIONIST
            // Example: Check for specific roles in auth.getAuthorities()
            if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"))) {
                attendanceLog.setRecordedBy(RecordedByType.OWNER);
            } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTIONIST"))) {
                attendanceLog.setRecordedBy(RecordedByType.RECEPTIONIST);
            } else {
                // Default to SYSTEM if a logged-in user doesn't fit the known types
                attendanceLog.setRecordedBy(RecordedByType.SYSTEM);
            }
        } else {
            // No authenticated user, so it must be a system process
            attendanceLog.setRecordedBy(RecordedByType.SYSTEM);
        }

        AttendanceLog saved = attendanceLogRepository.save(attendanceLog);

        // Create a notification for real-time awareness
        String memberName = saved.getMember() != null ? (saved.getMember().getFirstName() + " " + saved.getMember().getLastName()) : "Member";
        String who = saved.getRecordedBy() != null ? saved.getRecordedBy().name() : "SYSTEM";
        String title = "New check-in";
        String message = memberName.trim() + " checked in at " + java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(saved.getCheckInTime()) + " (by " + who + ")";
        // Notify OWNER only
        try {
            notificationService.createOwnerNotification(title, message);
        } catch (Exception ignore) { /* non-critical */ }

        return saved;
    }
}