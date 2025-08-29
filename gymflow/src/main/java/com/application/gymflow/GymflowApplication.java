package com.application.gymflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GymflowApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymflowApplication.class, args);
	}

}
