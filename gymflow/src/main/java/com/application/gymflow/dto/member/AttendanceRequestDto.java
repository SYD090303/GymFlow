package com.application.gymflow.dto.member;

import com.application.gymflow.enums.member.RecordedByType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(
        name = "AttendanceRequest",
        description = "Schema to hold the details for logging a member's attendance"
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequestDto {

    @Schema(
            description = "Specifies who recorded the attendance (e.g., RECEPTIONIST)",
            example = "RECEPTIONIST"
    )
    @NotNull(message = "The 'recordedBy' field must not be null")
    private RecordedByType recordedBy;
}