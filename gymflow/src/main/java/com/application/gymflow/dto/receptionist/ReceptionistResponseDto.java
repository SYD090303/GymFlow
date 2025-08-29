package com.application.gymflow.dto.receptionist;

import com.application.gymflow.enums.common.Gender;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.enums.receptionist.Shift;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionistResponseDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Status status;
    private String profilePictureUrl;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private LocalDate dateOfJoining;
    private Shift shift;
    private double salary;
    private String emergencyContactName;
    private String emergencyContactPhone;
}