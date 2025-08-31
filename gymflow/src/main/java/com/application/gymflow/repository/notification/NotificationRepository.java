package com.application.gymflow.repository.notification;

import com.application.gymflow.model.notification.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByAudienceOrderByCreatedAtDesc(Notification.Audience audience);
    List<Notification> findTop20ByAudienceAndReadFlagFalseOrderByCreatedAtDesc(Notification.Audience audience);
}
