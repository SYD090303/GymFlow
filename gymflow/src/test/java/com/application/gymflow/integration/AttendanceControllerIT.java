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
import java.time.LocalDateTime;
import java.util.HashMap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AttendanceControllerIT {

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

    private long createPlan(String bearer) throws Exception {
        var planReq = new HashMap<String, Object>();
        planReq.put("planType", "HARDCORE");
        planReq.put("price", 500.0);
        planReq.put("description", "Plan A");
        planReq.put("duration", "ONE_MONTH");
        MvcResult res = mockMvc.perform(post("/api/v1/membership-plans/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();
    }

    private long createMember(String bearer, long planId) throws Exception {
        var memberReq = new java.util.HashMap<String, Object>();
        memberReq.put("email", "att1@example.com");
        memberReq.put("firstName", "Att");
        memberReq.put("lastName", "endee");
        memberReq.put("password", "Member@123");
        memberReq.put("phone", "9999999999");
        memberReq.put("membershipPlanId", planId);
        memberReq.put("startDate", LocalDate.now().toString());
        memberReq.put("autoRenew", true);
        memberReq.put("amountPaid", 500.0);
        memberReq.put("paymentMethod", "CASH");
        memberReq.put("height", 170.0);
        memberReq.put("weight", 65.0);
        memberReq.put("medicalConditions", null);
        memberReq.put("injuries", null);
        memberReq.put("allergies", null);
        MvcResult res = mockMvc.perform(post("/api/v1/members/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(memberReq)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    void check_in_out_and_queries_work() throws Exception {
        String bearer = ownerBearer();
        long planId = createPlan(bearer);
        long memberId = createMember(bearer, planId);

        // Check-in
        var inBody = new HashMap<String, Object>();
        inBody.put("attendanceStatus", "PRESENT");
        inBody.put("checkInTime", LocalDateTime.now().toString());
        mockMvc.perform(post("/api/v1/attendance/member/" + memberId + "/check-in")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberId").value(memberId));

        // Check-out
        var outBody = new HashMap<String, Object>();
        outBody.put("checkOutTime", LocalDateTime.now().toString());
        mockMvc.perform(post("/api/v1/attendance/member/" + memberId + "/check-out")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memberId").value(memberId))
                .andExpect(jsonPath("$.checkOutTime").exists());

        // By member
        mockMvc.perform(get("/api/v1/attendance/member/" + memberId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].memberId").value(memberId));

        // Today
        mockMvc.perform(get("/api/v1/attendance/today")
                        .header("Authorization", bearer))
                .andExpect(status().isOk());
    }
}
