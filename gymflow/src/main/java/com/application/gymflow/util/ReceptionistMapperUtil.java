package com.application.gymflow.util;

import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;
import com.application.gymflow.model.receptionist.Receptionist;
// Note: This is a utility fallback mapper not used by Spring. The actual bean lives in
// package com.application.gymflow.mapper.receptionist.ReceptionistMapper
// Keeping this file non-component to avoid duplicate bean/class conflicts.
public class ReceptionistMapperUtil {

    public Receptionist toReceptionist(ReceptionistCreateRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return Receptionist.builder()
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .addressLine1(dto.getAddressLine1())
                .addressLine2(dto.getAddressLine2())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .country(dto.getCountry())
                .dateOfJoining(dto.getDateOfJoining())
                .shift(dto.getShift())
                .salary(dto.getSalary())
                .emergencyContactName(dto.getEmergencyContactName())
                .emergencyContactPhone(dto.getEmergencyContactPhone())
                .status(dto.getStatus())
                .build();
    }

    public ReceptionistResponseDto toReceptionistResponseDto(Receptionist receptionist) {
        if (receptionist == null) {
            return null;
        }
        return ReceptionistResponseDto.builder()
                .id(receptionist.getId())
                .email(receptionist.getEmail())
                .firstName(receptionist.getFirstName())
                .lastName(receptionist.getLastName())
                .gender(receptionist.getGender())
                .dateOfBirth(receptionist.getDateOfBirth())
                .addressLine1(receptionist.getAddressLine1())
                .addressLine2(receptionist.getAddressLine2())
                .city(receptionist.getCity())
                .state(receptionist.getState())
                .postalCode(receptionist.getPostalCode())
                .country(receptionist.getCountry())
                .dateOfJoining(receptionist.getDateOfJoining())
                .shift(receptionist.getShift())
                .salary(receptionist.getSalary())
                .emergencyContactName(receptionist.getEmergencyContactName())
                .emergencyContactPhone(receptionist.getEmergencyContactPhone())
                .status(receptionist.getStatus())
                .build();
    }

    public void updateReceptionistFromDto(ReceptionistCreateRequestDto dto, Receptionist receptionist) {
        if (dto == null || receptionist == null) {
            return;
        }
        receptionist.setFirstName(dto.getFirstName());
        receptionist.setLastName(dto.getLastName());
        receptionist.setGender(dto.getGender());
        receptionist.setDateOfBirth(dto.getDateOfBirth());
        receptionist.setAddressLine1(dto.getAddressLine1());
        receptionist.setAddressLine2(dto.getAddressLine2());
        receptionist.setCity(dto.getCity());
        receptionist.setState(dto.getState());
        receptionist.setPostalCode(dto.getPostalCode());
        receptionist.setCountry(dto.getCountry());
        receptionist.setDateOfJoining(dto.getDateOfJoining());
        receptionist.setShift(dto.getShift());
        receptionist.setSalary(dto.getSalary());
        receptionist.setEmergencyContactName(dto.getEmergencyContactName());
        receptionist.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        // not update email, password, or status here.
    }
}