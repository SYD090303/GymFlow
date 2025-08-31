package com.application.gymflow.repository.receptionist;

import com.application.gymflow.model.receptionist.Receptionist;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {
	Optional<Receptionist> findByEmail(String email);
	boolean existsByEmail(String email);
}
