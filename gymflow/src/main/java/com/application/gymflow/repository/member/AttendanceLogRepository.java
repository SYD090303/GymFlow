package com.application.gymflow.repository.member;

import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.model.member.AttendanceLog;
import com.application.gymflow.model.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    List<AttendanceLog> findByMember(Member member);

    List<AttendanceLog> findByAttendanceStatus(AttendanceStatus status);

    List<AttendanceLog> findByCheckInTimeBetween(LocalDateTime start, LocalDateTime end);
}
