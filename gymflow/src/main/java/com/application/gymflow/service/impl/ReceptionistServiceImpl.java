package com.application.gymflow.service.impl;

import com.application.gymflow.dto.auth.RegisterRequest;
import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;
import com.application.gymflow.enums.common.Status;
import com.application.gymflow.exception.receptionist.ReceptionistNotFoundException;
import com.application.gymflow.exception.user.UserNotFoundException;
import com.application.gymflow.model.auth.Role;
import com.application.gymflow.model.auth.User;
import com.application.gymflow.model.receptionist.Receptionist;
import com.application.gymflow.repository.auth.UserRepository;
import com.application.gymflow.repository.receptionist.ReceptionistRepository;
import com.application.gymflow.service.ReceptionistService;
import com.application.gymflow.service.auth.AuthService;
import com.application.gymflow.mapper.receptionist.ReceptionistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final AuthService authService;
    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final ReceptionistMapper receptionistMapper;

    /**
     * Create a new Receptionist (with linked User Creation).
     *
     * @param requestDto details for creating Receptionist & User
     * @return created ReceptionistResponseDto
     */
    @Override
    @Transactional
    public ReceptionistResponseDto createReceptionist(ReceptionistCreateRequestDto requestDto) {
        // Use AuthService to create the user and check for duplicates
        authService.createUser(
                RegisterRequest.builder()
                        .email(requestDto.getEmail())
                        .password(requestDto.getPassword())
                        .firstName(requestDto.getFirstName())
                        .lastName(requestDto.getLastName())
                        .roleName(Role.RoleName.RECEPTIONIST)
                        .status(Status.ACTIVE)
                        .build()
        );

        // Map the DTO to the Receptionist entity
        Receptionist receptionist = receptionistMapper.toReceptionist(requestDto);

        // Save the receptionist details
        receptionistRepository.save(receptionist);

        // Map the created entity to the response DTO
        return receptionistMapper.toReceptionistResponseDto(receptionist);
    }

    /**
     * Update an existing Receptionist by ID.
     *
     * @param id      Receptionist Long
     * @param request updated details
     * @return updated ReceptionistResponseDto
     */
    @Override
    @Transactional
    public ReceptionistResponseDto updateReceptionist(Long id, ReceptionistCreateRequestDto request) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ReceptionistNotFoundException("Receptionist not found with ID: " + id));

        // Update basic receptionist details
        receptionistMapper.updateReceptionistFromDto(request, receptionist);

        // Save the updated receptionist
        Receptionist updatedReceptionist = receptionistRepository.save(receptionist);

        // Update the corresponding User details if the email has changed.
        // This is a crucial step to keep user and receptionist entities in sync.
        User user = userRepository.findByEmail(receptionist.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Corresponding user not found for receptionist ID: " + id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        // Do not update the password here, as it requires a separate endpoint
        // Do not update email without a dedicated process, as it's a primary key.
        userRepository.save(user);

        return receptionistMapper.toReceptionistResponseDto(updatedReceptionist);
    }

    /**
     * Get a Receptionist by ID.
     *
     * @param id Receptionist Long
     * @return ReceptionistResponseDto
     */
    @Override
    public ReceptionistResponseDto getReceptionistById(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ReceptionistNotFoundException("Receptionist not found with ID: " + id));
        return receptionistMapper.toReceptionistResponseDto(receptionist);
    }

    /**
     * Get all Receptionists.
     *
     * @return List of ReceptionistResponseDto
     */
    @Override
    public List<ReceptionistResponseDto> getAllReceptionists() {
        return receptionistRepository.findAll().stream()
                .map(receptionistMapper::toReceptionistResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Soft delete a Receptionist (disable User + Receptionist).
     *
     * @param id Receptionist Long
     */
    @Override
    @Transactional
    public void deleteReceptionist(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ReceptionistNotFoundException("Receptionist not found with ID: " + id));

        // Mark the receptionist as inactive
        receptionist.setStatus(Status.INACTIVE);
        receptionistRepository.save(receptionist);

        // Also mark the corresponding user as inactive
        User user = userRepository.findByEmail(receptionist.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Corresponding user not found for receptionist ID: " + id));
        user.setStatus(Status.INACTIVE);
        userRepository.save(user);
    }

    /**
     * Activate a Receptionist (enable User + mark active).
     *
     * @param id Receptionist Long
     * @return activated ReceptionistResponseDto
     */
    @Override
    @Transactional
    public ReceptionistResponseDto activateReceptionist(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ReceptionistNotFoundException("Receptionist not found with ID: " + id));

        // Mark the receptionist as active
        receptionist.setStatus(Status.ACTIVE);
        receptionistRepository.save(receptionist);

        // Also mark the corresponding user as active
        User user = userRepository.findByEmail(receptionist.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Corresponding user not found for receptionist ID: " + id));
        user.setStatus(Status.ACTIVE);
        userRepository.save(user);

        return receptionistMapper.toReceptionistResponseDto(receptionist);
    }

    /**
     * Deactivate a Receptionist (disable User + mark inactive).
     *
     * @param id Receptionist Long
     * @return deactivated ReceptionistResponseDto
     */
    @Override
    @Transactional
    public ReceptionistResponseDto deactivateReceptionist(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ReceptionistNotFoundException("Receptionist not found with ID: " + id));

        // Mark the receptionist as inactive
        receptionist.setStatus(Status.INACTIVE);
        receptionistRepository.save(receptionist);

        // Also mark the corresponding user as inactive
        User user = userRepository.findByEmail(receptionist.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Corresponding user not found for receptionist ID: " + id));
        user.setStatus(Status.INACTIVE);
        userRepository.save(user);

        return receptionistMapper.toReceptionistResponseDto(receptionist);
    }
}