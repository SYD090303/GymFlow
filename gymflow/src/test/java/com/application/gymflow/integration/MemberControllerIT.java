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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MemberControllerIT {

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
    void member_soft_delete_hides_from_list_and_get_by_id_404() throws Exception {
        String bearer = ownerBearer();

        // Create a plan first
        var planReq = new HashMap<String, Object>();
        planReq.put("planType", "HARDCORE");
        planReq.put("price", 600.0);
        planReq.put("description", "Plan M");
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
        memberReq.put("email", "softdel@example.com");
        memberReq.put("firstName", "Soft");
        memberReq.put("lastName", "Delete");
        memberReq.put("password", "Member@123");
        memberReq.put("phone", "9999999999");
        memberReq.put("membershipPlanId", planId);
        memberReq.put("startDate", LocalDate.now().toString());
        memberReq.put("autoRenew", true);
        memberReq.put("amountPaid", 600.0);
        memberReq.put("paymentMethod", "CASH");
        memberReq.put("height", 170.0);
        memberReq.put("weight", 65.0);
        memberReq.put("medicalConditions", null);
        memberReq.put("injuries", null);
        memberReq.put("allergies", null);
        MvcResult created = mockMvc.perform(post("/api/v1/members/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(memberReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();
        long memberId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();
        assertThat(memberId).isPositive();

        // List should include the member
        mockMvc.perform(get("/api/v1/members").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());

        // Delete (soft)
        mockMvc.perform(delete("/api/v1/members/" + memberId).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusMsg").exists());

        // Get by id should now 404 (service hides INACTIVE/soft-deleted) or controller throws not found
        mockMvc.perform(get("/api/v1/members/" + memberId).header("Authorization", bearer))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));

                // List should not include the soft-deleted member (others may exist)
                MvcResult listRes = mockMvc.perform(get("/api/v1/members").header("Authorization", bearer))
                                .andExpect(status().isOk())
                                .andReturn();
                var arr = objectMapper.readTree(listRes.getResponse().getContentAsString());
                boolean containsId = false;
                if (arr.isArray()) {
                        for (var n : arr) {
                                if (n.has("id") && n.get("id").asLong() == memberId) { containsId = true; break; }
                        }
                }
                assertThat(containsId).isFalse();
    }
}
