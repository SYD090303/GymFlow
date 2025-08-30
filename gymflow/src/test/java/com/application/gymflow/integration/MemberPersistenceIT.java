package com.application.gymflow.integration;

import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.Membership;
import com.application.gymflow.repository.member.MemberRepository;
import com.application.gymflow.repository.member.MembershipRepository;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MemberPersistenceIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired MemberRepository memberRepository;
    @Autowired MembershipRepository membershipRepository;

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
    void create_update_and_renew_member_persists_expected_db_state() throws Exception {
        String bearer = ownerBearer();

        // 1) Create plan
        var planReq = new HashMap<String, Object>();
        planReq.put("planType", "CARDIO");
        planReq.put("price", 800.0);
        planReq.put("description", "Cardio Plan");
        planReq.put("duration", "ONE_MONTH");
        MvcResult planRes = mockMvc.perform(post("/api/v1/membership-plans/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long planId = objectMapper.readTree(planRes.getResponse().getContentAsString()).get("id").asLong();

        // 2) Create member via API
        LocalDate startDate = LocalDate.now();
        var memberReq = new HashMap<String, Object>();
        memberReq.put("email", "persist.check@example.com");
        memberReq.put("firstName", "Persist");
        memberReq.put("lastName", "Check");
        memberReq.put("password", "Member@123");
        memberReq.put("phone", "8888888888");
        memberReq.put("membershipPlanId", planId);
        memberReq.put("startDate", startDate.toString());
        memberReq.put("autoRenew", true);
        memberReq.put("amountPaid", 800.0);
        memberReq.put("paymentMethod", "CASH");
        memberReq.put("height", 175.0);
        memberReq.put("weight", 70.0);

        MvcResult created = mockMvc.perform(post("/api/v1/members/create")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(memberReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.startDate").value(startDate.toString()))
                .andExpect(jsonPath("$.membershipPlan.id").value(planId))
                .andReturn();
        JsonNode createdJson = objectMapper.readTree(created.getResponse().getContentAsString());
        long memberId = createdJson.get("id").asLong();

        // 2a) Assert DB rows for Member and Membership
        Optional<Member> persistedOpt = memberRepository.findById(memberId);
        assertThat(persistedOpt).isPresent();
        Member persisted = persistedOpt.get();
        assertThat(persisted.getFirstName()).isEqualTo("Persist");
        assertThat(persisted.getLastName()).isEqualTo("Check");
        assertThat(persisted.getPhone()).isEqualTo("8888888888");

        Membership membership = persisted.getMembership();
        assertThat(membership).as("membership should be created").isNotNull();
        assertThat(membership.getMembershipPlan()).isNotNull();
        assertThat(membership.getMembershipPlan().getId()).isEqualTo(planId);
        assertThat(membership.getStartDate()).isEqualTo(startDate);
        assertThat(membership.getEndDate()).as("End date should be computed").isNotNull();

        // 3) Update member phone and name via API and re-check DB
        var updateReq = new HashMap<String, Object>();
        updateReq.put("firstName", "Updated");
        updateReq.put("lastName", "User");
        updateReq.put("phone", "1111111111");
        mockMvc.perform(put("/api/v1/members/" + memberId)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.phone").value("1111111111"));

        Member afterUpdate = memberRepository.findById(memberId).orElseThrow();
        assertThat(afterUpdate.getFirstName()).isEqualTo("Updated");
        assertThat(afterUpdate.getLastName()).isEqualTo("User");
        assertThat(afterUpdate.getPhone()).isEqualTo("1111111111");

        // 4) Renew membership and ensure dates changed in DB
        LocalDate newStart = LocalDate.now().plusDays(1);
        mockMvc.perform(post("/api/v1/members/" + memberId + "/renew-membership")
                        .header("Authorization", bearer)
                        .param("newStartDate", newStart.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value(newStart.toString()));

        Membership afterRenew = memberRepository.findById(memberId).orElseThrow().getMembership();
        assertThat(afterRenew.getStartDate()).isEqualTo(newStart);
        assertThat(afterRenew.getEndDate()).as("End date should be recomputed after renew").isNotNull();
        assertThat(afterRenew.getEndDate()).isAfterOrEqualTo(newStart);
    }
}
