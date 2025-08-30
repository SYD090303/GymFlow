package com.application.gymflow.controller.receptionist;

import com.application.gymflow.constants.MemberConstants;
import com.application.gymflow.dto.common.ResponseDto;
import com.application.gymflow.dto.receptionist.ReceptionistCreateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistUpdateRequestDto;
import com.application.gymflow.dto.receptionist.ReceptionistResponseDto;
import com.application.gymflow.service.ReceptionistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/receptionists", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @Operation(
            summary = "Create Receptionist REST API",
            description = "REST API to create a new Receptionist in the GymFlow system"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "HTTP Status CREATED",
                    content = @Content(
                            schema = @Schema(implementation = ReceptionistResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "HTTP Status BAD REQUEST (Validation Error)"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "HTTP Status CONFLICT (Duplicate User/Email)"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @PostMapping("/create")
    public ResponseEntity<ReceptionistResponseDto> createReceptionist(@Valid @RequestBody ReceptionistCreateRequestDto requestDto) {
        ReceptionistResponseDto createdReceptionist = receptionistService.createReceptionist(requestDto);
        return new ResponseEntity<>(createdReceptionist, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Fetch Receptionist by ID REST API",
            description = "REST API to fetch a Receptionist's details based on a given ID"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = ReceptionistResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "HTTP Status NOT FOUND"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ReceptionistResponseDto> getReceptionistById(@PathVariable Long id) {
        ReceptionistResponseDto receptionist = receptionistService.getReceptionistById(id);
        return new ResponseEntity<>(receptionist, HttpStatus.OK);
    }

    @Operation(
            summary = "Fetch All Receptionists REST API",
            description = "REST API to fetch all Receptionist details from the GymFlow system"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = List.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @GetMapping
    public ResponseEntity<List<ReceptionistResponseDto>> getAllReceptionists() {
        List<ReceptionistResponseDto> receptionists = receptionistService.getAllReceptionists();
        return new ResponseEntity<>(receptionists, HttpStatus.OK);
    }

    @Operation(
            summary = "Update Receptionist REST API",
            description = "REST API to update an existing Receptionist's details based on a given ID"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = ReceptionistResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "HTTP Status NOT FOUND"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @PutMapping("/{id}")
        public ResponseEntity<ReceptionistResponseDto> updateReceptionist(@PathVariable Long id,
                                                                                                                                          @Valid @RequestBody ReceptionistUpdateRequestDto request) {
                ReceptionistResponseDto updatedReceptionist = receptionistService.updateReceptionist(id, request);
        return new ResponseEntity<>(updatedReceptionist, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete Receptionist REST API",
            description = "REST API to soft delete a Receptionist (marks as inactive)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = ResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "HTTP Status NOT FOUND"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deleteReceptionist(@PathVariable Long id) {
        receptionistService.deleteReceptionist(id);
        return new ResponseEntity<>(new ResponseDto(MemberConstants.STATUS_200, "Receptionist deleted successfully"), HttpStatus.OK);
    }

    @Operation(
            summary = "Activate Receptionist REST API",
            description = "REST API to activate an inactive Receptionist"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = ReceptionistResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "HTTP Status NOT FOUND"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @PutMapping("/activate/{id}")
    public ResponseEntity<ReceptionistResponseDto> activateReceptionist(@PathVariable Long id) {
        ReceptionistResponseDto activatedReceptionist = receptionistService.activateReceptionist(id);
        return new ResponseEntity<>(activatedReceptionist, HttpStatus.OK);
    }

    @Operation(
            summary = "Deactivate Receptionist REST API",
            description = "REST API to deactivate an active Receptionist"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "HTTP Status OK",
                    content = @Content(
                            schema = @Schema(implementation = ReceptionistResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "HTTP Status NOT FOUND"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "HTTP Status INTERNAL SERVER ERROR"
            )
    })
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<ReceptionistResponseDto> deactivateReceptionist(@PathVariable Long id) {
        ReceptionistResponseDto deactivatedReceptionist = receptionistService.deactivateReceptionist(id);
        return new ResponseEntity<>(deactivatedReceptionist, HttpStatus.OK);
    }
}