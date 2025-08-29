package com.application.gymflow.model.member;

import com.application.gymflow.enums.member.AttendanceStatus;
import com.application.gymflow.enums.member.RecordedByType;
import com.application.gymflow.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AttendanceLog extends BaseEntity {

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // --- Attendance Info ---
    @Column(nullable = false)
    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;


    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceStatus attendanceStatus; // PRESENT, LATE, MISSED, EXCUSED

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RecordedByType recordedBy;
}
