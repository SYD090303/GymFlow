package com.application.gymflow.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.HashMap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReceptionistControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String ownerBearer() throws Exception {
        var login = java.util.Map.of("email", "owner@gymapp.com", "password", "Owner@123");
        MvcResult loginRes = mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("token").asText();
        return "Bearer " + token;
    }

    private HashMap<String, Object> sampleReceptionistBody() {
        var body = new HashMap<String, Object>();
        body.put("email", "rec1@example.com");
        body.put("password", "Reception@123");
        body.put("firstName", "Rec");
        body.put("lastName", "One");
        body.put("gender", "MALE");
        body.put("dateOfBirth", LocalDate.now().minusYears(25).toString());
        body.put("dateOfJoining", LocalDate.now().toString());
        body.put("shift", "MORNING");
        body.put("salary", 30000.0);
        body.put("addressLine1", "A1");
        body.put("city", "City");
        body.put("state", "State");
        body.put("postalCode", "12345");
        body.put("country", "IN");
        return body;
    }

    @Test
    void owner_can_manage_receptionist() throws Exception {
        String bearer = ownerBearer();

        // Create
        MvcResult createRes = mockMvc.perform(post("/api/v1/receptionists/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleReceptionistBody())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();
        long id = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        // Get
        mockMvc.perform(get("/api/v1/receptionists/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("rec1@example.com"));

        // List
        mockMvc.perform(get("/api/v1/receptionists")
                        .header("Authorization", bearer))
                .andExpect(status().isOk());

        // Update
        var update = sampleReceptionistBody();
        update.put("firstName", "RecUpdated");
        mockMvc.perform(put("/api/v1/receptionists/" + id)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("RecUpdated"));

        // Activate / Deactivate
        mockMvc.perform(put("/api/v1/receptionists/activate/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/v1/receptionists/deactivate/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk());

        // Delete
        mockMvc.perform(delete("/api/v1/receptionists/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk());
    }
}
