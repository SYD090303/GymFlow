package com.application.gymflow.exception.receptionist;


import com.application.gymflow.exception.user.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ReceptionistNotFoundException extends ResourceNotFoundException {
    public ReceptionistNotFoundException(String message) {
        super(message);
    }
}