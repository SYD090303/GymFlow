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

import java.util.HashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MembershipPlanControllerIT {

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
    void owner_can_crud_and_toggle_membership_plan() throws Exception {
        String bearer = ownerBearer();

        // Create
        var planReq = new HashMap<String, Object>();
        planReq.put("planType", "HARDCORE");
        planReq.put("price", 500.0);
        planReq.put("description", "Plan A");
        planReq.put("duration", "ONE_MONTH");
        MvcResult createRes = mockMvc.perform(post("/api/v1/membership-plans/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();
        long id = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();
        assertThat(id).isPositive();

        // Get by id
        mockMvc.perform(get("/api/v1/membership-plans/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Plan A"));

        // Update
        planReq.put("price", 750.0);
        planReq.put("description", "Plan A+ ");
        mockMvc.perform(put("/api/v1/membership-plans/" + id)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(750.0));

        // Activate and deactivate
        mockMvc.perform(patch("/api/v1/membership-plans/" + id + "/activate")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusMsg").exists());

        mockMvc.perform(patch("/api/v1/membership-plans/" + id + "/deactivate")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusMsg").exists());

                // List should not include the deactivated plan (but may include others from other tests)
                MvcResult listRes = mockMvc.perform(get("/api/v1/membership-plans")
                                                .header("Authorization", bearer))
                                .andExpect(status().isOk())
                                .andReturn();
                var arr = objectMapper.readTree(listRes.getResponse().getContentAsString());
                boolean containsId = false;
                if (arr.isArray()) {
                        for (var n : arr) {
                                if (n.has("id") && n.get("id").asLong() == id) { containsId = true; break; }
                        }
                }
                assertThat(containsId).isFalse();

        // Delete
        mockMvc.perform(delete("/api/v1/membership-plans/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusMsg").exists());

        // Get after delete -> expect 404 Not Found with error payload
        mockMvc.perform(get("/api/v1/membership-plans/" + id)
                        .header("Authorization", bearer))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));
    }
}
