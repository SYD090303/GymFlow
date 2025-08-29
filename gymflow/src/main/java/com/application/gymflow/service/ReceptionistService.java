package com.application.gymflow.service;



import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;

import java.util.List;


public interface ReceptionistService {

    /**
     * Create a new Receptionist (with linked User account).
     *
     * @param request details for creating Receptionist & User
     * @return created ReceptionistResponseDto
     */
    ReceptionistResponseDto createReceptionist(ReceptionistCreateRequestDto request);

    /**
     * Update an existing Receptionist by ID.
     *
     * @param id      Receptionist Long
     * @param request updated details
     * @return updated ReceptionistResponseDto
     */
    ReceptionistResponseDto updateReceptionist(Long id, ReceptionistCreateRequestDto request);

    /**
     * Get a Receptionist by ID.
     *
     * @param id Receptionist Long
     * @return ReceptionistResponseDto
     */
    ReceptionistResponseDto getReceptionistById(Long id);

    /**
     * Get all Receptionists.
     *
     * @return List of ReceptionistResponseDto
     */
    List<ReceptionistResponseDto> getAllReceptionists();

    /**
     * Soft delete a Receptionist (disable User + Receptionist).
     *
     * @param id Receptionist Long
     */
    void deleteReceptionist(Long id);

    /**
     * Activate a Receptionist (enable User + mark active).
     *
     * @param id Receptionist Long
     * @return activated ReceptionistResponseDto
     */
    ReceptionistResponseDto activateReceptionist(Long id);

    /**
     * Deactivate a Receptionist (disable User + mark inactive).
     *
     * @param id Receptionist Long
     * @return deactivated ReceptionistResponseDto
     */
    ReceptionistResponseDto deactivateReceptionist(Long id);
}
