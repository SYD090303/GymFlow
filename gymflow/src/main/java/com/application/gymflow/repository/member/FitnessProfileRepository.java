package com.application.gymflow.repository.member;

import com.application.gymflow.model.member.FitnessProfile;
import com.application.gymflow.model.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FitnessProfileRepository extends JpaRepository<FitnessProfile, Long> {
    Optional<FitnessProfile> findByMember(Member member);
}