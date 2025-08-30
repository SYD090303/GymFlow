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
class AttendanceInactiveIT {

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

    @Test
    void attendance_blocked_for_inactive_member() throws Exception {
        String bearer = ownerBearer();

        // Create plan
        var planReq = new HashMap<String, Object>();
        planReq.put("planType", "HARDCORE");
        planReq.put("price", 400.0);
        planReq.put("description", "Short");
        planReq.put("duration", "ONE_MONTH");
        long planId = objectMapper.readTree(
                mockMvc.perform(post("/api/v1/membership-plans/create")
                                .header("Authorization", bearer)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(planReq)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString()
        ).get("id").asLong();

        // Create member
        var memberReq = new java.util.HashMap<String, Object>();
        memberReq.put("email", "inactive.att@example.com");
        memberReq.put("firstName", "InActive");
        memberReq.put("lastName", "Member");
        memberReq.put("password", "Member@123");
        memberReq.put("phone", "9000000001");
        memberReq.put("membershipPlanId", planId);
        memberReq.put("startDate", LocalDate.now().toString());
        memberReq.put("autoRenew", true);
        memberReq.put("amountPaid", 400.0);
        memberReq.put("paymentMethod", "CASH");
        memberReq.put("height", 168.0);
        memberReq.put("weight", 60.0);
        memberReq.put("medicalConditions", null);
        memberReq.put("injuries", null);
        memberReq.put("allergies", null);
        long memberId = objectMapper.readTree(
                mockMvc.perform(post("/api/v1/members/create")
                                .header("Authorization", bearer)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(memberReq)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString()
        ).get("id").asLong();

        // Deactivate member
        mockMvc.perform(put("/api/v1/members/deactivate/" + memberId).header("Authorization", bearer))
                .andExpect(status().isOk());

        // Attempt attendance log via member controller nested endpoint -> 403
        var attReq = java.util.Map.of("recordedBy", "RECEPTIONIST");
        mockMvc.perform(post("/api/v1/members/" + memberId + "/attendance")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));

        // Also block attendance controller check-in endpoint
        mockMvc.perform(post("/api/v1/attendance/member/" + memberId + "/check-in")
                        .header("Authorization", bearer))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }
}
