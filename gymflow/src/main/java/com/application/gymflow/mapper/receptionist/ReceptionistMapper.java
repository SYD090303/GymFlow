package com.application.gymflow.mapper.receptionist;

import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;
import com.application.gymflow.dto.receptionist.ReceptionistUpdateRequestDto;
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

    public void updateReceptionistFromUpdateDto(ReceptionistUpdateRequestDto dto, Receptionist r) {
        if (dto == null || r == null) return;
        if (dto.getFirstName() != null) r.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) r.setLastName(dto.getLastName());
        if (dto.getStatus() != null) r.setStatus(dto.getStatus());
        if (dto.getGender() != null) r.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null) r.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getAddressLine1() != null) r.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) r.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) r.setCity(dto.getCity());
        if (dto.getState() != null) r.setState(dto.getState());
        if (dto.getPostalCode() != null) r.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null) r.setCountry(dto.getCountry());
        if (dto.getDateOfJoining() != null) r.setDateOfJoining(dto.getDateOfJoining());
        if (dto.getShift() != null) r.setShift(dto.getShift());
        if (dto.getSalary() != null) r.setSalary(dto.getSalary());
        if (dto.getEmergencyContactName() != null) r.setEmergencyContactName(dto.getEmergencyContactName());
        if (dto.getEmergencyContactPhone() != null) r.setEmergencyContactPhone(dto.getEmergencyContactPhone());
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
