package com.application.gymflow.exception;

import com.application.gymflow.dto.common.ErrorResponseDto;

import com.application.gymflow.exception.receptionist.ReceptionistNotFoundException;
import com.application.gymflow.exception.user.*;
import com.application.gymflow.exception.membership.*;
import com.application.gymflow.exception.member.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // --------------------- VALIDATION ERRORS ---------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationException(MethodArgumentNotValidException ex,
                                                                      HttpServletRequest request) {
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.BAD_REQUEST,
                errors,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // --------------------- ALREADY EXISTS ---------------------
    @ExceptionHandler({AlreadyExistsException.class, DuplicateUserException.class, DuplicateMemberException.class})
    public ResponseEntity<ErrorResponseDto> handleAlreadyExists(RuntimeException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.CONFLICT,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // --------------------- RESOURCE NOT FOUND ---------------------
        @ExceptionHandler({ResourceNotFoundException.class,
                        UserNotFoundException.class,
                        MemberNotFoundException.class,
                        ReceptionistNotFoundException.class,
                        com.application.gymflow.exception.membership.MembershipPlanNotFoundException.class})
    public ResponseEntity<ErrorResponseDto> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // --------------------- INVALID CREDENTIALS / AUTH ---------------------
    @ExceptionHandler({InvalidCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponseDto> handleAuthException(RuntimeException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // --------------------- INACTIVE USER OR MEMBER ---------------------
    @ExceptionHandler({InactiveUserException.class, MemberInactiveException.class})
    public ResponseEntity<ErrorResponseDto> handleInactive(RuntimeException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.FORBIDDEN,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // --------------------- MEMBER OPERATION ERRORS ---------------------
    @ExceptionHandler(MemberOperationException.class)
    public ResponseEntity<ErrorResponseDto> handleMemberOperation(MemberOperationException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.EXPECTATION_FAILED,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(response);
    }

    // --------------------- ATTENDANCE OPERATION ERRORS ---------------------
    @ExceptionHandler(AttendanceOperationException.class)
    public ResponseEntity<ErrorResponseDto> handleAttendanceOperation(AttendanceOperationException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // --------------------- FILE STORAGE ERRORS ---------------------
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ErrorResponseDto> handleFileStorage(FileStorageException ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // --------------------- GENERAL ERRORS ---------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneralException(Exception ex, HttpServletRequest request) {
        ErrorResponseDto response = new ErrorResponseDto(
                request.getRequestURI(),
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
