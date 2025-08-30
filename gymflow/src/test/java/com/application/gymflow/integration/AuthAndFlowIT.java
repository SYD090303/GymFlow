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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndFlowIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void end_to_end_owner_creates_plan_then_member_then_attendance() throws Exception {
        // 1) Owner login (seeded by DataInitializer)
        var login = java.util.Map.of("email", "owner@gymapp.com", "password", "Owner@123");
        MvcResult loginRes = mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("token").asText();
        String bearer = "Bearer " + token;

        // 2) Create a membership plan
        var planReq = new java.util.HashMap<String, Object>();
        planReq.put("planType", "HARDCORE");
        planReq.put("price", 999.0);
        planReq.put("description", "Test Plan");
        planReq.put("duration", "ONE_MONTH");
        MvcResult planRes = mockMvc.perform(post("/api/v1/membership-plans/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long planId = objectMapper.readTree(planRes.getResponse().getContentAsString()).get("id").asLong();

        // 3) Create a member under that plan
        var memberReq = new java.util.HashMap<String, Object>();
        memberReq.put("email", "mem1@example.com");
        memberReq.put("firstName", "Mem");
        memberReq.put("lastName", "Ber");
        memberReq.put("password", "Member@123");
        memberReq.put("phone", "9876543210");
        memberReq.put("membershipPlanId", planId);
        memberReq.put("startDate", LocalDate.now().toString());
        memberReq.put("autoRenew", true);
        memberReq.put("amountPaid", 999.0);
        memberReq.put("paymentMethod", "CASH");
        memberReq.put("height", 175.0);
        memberReq.put("weight", 70.0);
        memberReq.put("medicalConditions", null);
        memberReq.put("injuries", null);
        memberReq.put("allergies", null);
        MvcResult memRes = mockMvc.perform(post("/api/v1/members/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(memberReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long memberId = objectMapper.readTree(memRes.getResponse().getContentAsString()).get("id").asLong();
        assertThat(memberId).isPositive();

        // 4) Log attendance via member controller nested endpoint
        var attReq = java.util.Map.of("recordedBy", "RECEPTIONIST");
        mockMvc.perform(post("/api/v1/members/" + memberId + "/attendance")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberId").value(memberId));

        // 5) Verify list endpoints return something
        mockMvc.perform(get("/api/v1/members")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").exists());

        mockMvc.perform(get("/api/v1/attendance/member/" + memberId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].memberId").value(memberId));
    }
}
