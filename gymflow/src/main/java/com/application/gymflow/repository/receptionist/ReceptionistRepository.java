package com.application.gymflow.repository.receptionist;

import com.application.gymflow.model.receptionist.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {
}
