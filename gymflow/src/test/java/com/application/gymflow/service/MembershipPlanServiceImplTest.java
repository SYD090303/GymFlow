package com.application.gymflow.service;

import com.application.gymflow.enums.common.Status;
import com.application.gymflow.exception.membership.MembershipPlanNotFoundException;
import com.application.gymflow.model.membership.MembershipPlan;
import com.application.gymflow.repository.membership.MembershipPlanRepository;
import com.application.gymflow.service.impl.MembershipPlanServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class MembershipPlanServiceImplTest {

    private MembershipPlanRepository repo;
    private MembershipPlanServiceImpl service;

    @BeforeEach
    void setup() {
        repo = Mockito.mock(MembershipPlanRepository.class);
        service = new MembershipPlanServiceImpl(repo);
    }

    @Test
    void activate_sets_status_active() {
        MembershipPlan plan = MembershipPlan.builder().status(Status.INACTIVE).build();
        when(repo.findById(1L)).thenReturn(Optional.of(plan));

        service.activatePlan(1L);

        ArgumentCaptor<MembershipPlan> cap = ArgumentCaptor.forClass(MembershipPlan.class);
        verify(repo).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(Status.ACTIVE);
    }

    @Test
    void deactivate_sets_status_inactive() {
        MembershipPlan plan = MembershipPlan.builder().status(Status.ACTIVE).build();
        when(repo.findById(2L)).thenReturn(Optional.of(plan));

        service.deactivatePlan(2L);

        ArgumentCaptor<MembershipPlan> cap = ArgumentCaptor.forClass(MembershipPlan.class);
        verify(repo).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(Status.INACTIVE);
    }

    @Test
    void activate_throws_when_missing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.activatePlan(99L))
                .isInstanceOf(MembershipPlanNotFoundException.class);
    }

    @Test
    void deactivate_throws_when_missing() {
        when(repo.findById(98L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.deactivatePlan(98L))
                .isInstanceOf(MembershipPlanNotFoundException.class);
    }
}
