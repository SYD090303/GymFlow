package com.application.gymflow.mapper.receptionist;

import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.model.receptionist.Receptionist;
import org.springframework.stereotype.Component;

@Component
public class ReceptionistMapper {

    public Receptionist toReceptionist(ReceptionistCreateRequestDto dto) {
        if (dto == null) return null;
        Receptionist r = new Receptionist();
        r.setEmail(dto.getEmail());
        r.setFirstName(dto.getFirstName());
        r.setLastName(dto.getLastName());
        r.setStatus(dto.getStatus() != null ? dto.getStatus() : Status.ACTIVE);
        r.setGender(dto.getGender());
        r.setDateOfBirth(dto.getDateOfBirth());
        r.setAddressLine1(dto.getAddressLine1());
        r.setAddressLine2(dto.getAddressLine2());
        r.setCity(dto.getCity());
        r.setState(dto.getState());
        r.setPostalCode(dto.getPostalCode());
        r.setCountry(dto.getCountry());
        r.setDateOfJoining(dto.getDateOfJoining());
        r.setShift(dto.getShift());
        r.setSalary(dto.getSalary());
        r.setEmergencyContactName(dto.getEmergencyContactName());
        r.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        return r;
    }

    public void updateReceptionistFromDto(ReceptionistCreateRequestDto dto, Receptionist r) {
        if (dto == null || r == null) return;
        // Do not update email here to avoid breaking the user linkage unless handled elsewhere
        r.setFirstName(dto.getFirstName());
        r.setLastName(dto.getLastName());
        if (dto.getStatus() != null) {
            r.setStatus(dto.getStatus());
        }
        r.setGender(dto.getGender());
        r.setDateOfBirth(dto.getDateOfBirth());
        r.setAddressLine1(dto.getAddressLine1());
        r.setAddressLine2(dto.getAddressLine2());
        r.setCity(dto.getCity());
        r.setState(dto.getState());
        r.setPostalCode(dto.getPostalCode());
        r.setCountry(dto.getCountry());
        r.setDateOfJoining(dto.getDateOfJoining());
        r.setShift(dto.getShift());
        r.setSalary(dto.getSalary());
        r.setEmergencyContactName(dto.getEmergencyContactName());
        r.setEmergencyContactPhone(dto.getEmergencyContactPhone());
    }

    public ReceptionistResponseDto toReceptionistResponseDto(Receptionist r) {
        if (r == null) return null;
        return ReceptionistResponseDto.builder()
                .id(r.getId())
                .email(r.getEmail())
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .status(r.getStatus())
                .profilePictureUrl(r.getProfilePictureUrl())
                .gender(r.getGender())
                .dateOfBirth(r.getDateOfBirth())
                .addressLine1(r.getAddressLine1())
                .addressLine2(r.getAddressLine2())
                .city(r.getCity())
                .state(r.getState())
                .postalCode(r.getPostalCode())
                .country(r.getCountry())
                .dateOfJoining(r.getDateOfJoining())
                .shift(r.getShift())
                .salary(r.getSalary())
                .emergencyContactName(r.getEmergencyContactName())
                .emergencyContactPhone(r.getEmergencyContactPhone())
                .build();
    }
}
