package com.application.gymflow.repository.member;

import com.application.gymflow.model.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);

    List<Member> findByMembership_EndDateBefore(LocalDate date);
    List<Member> findByMembership_EndDateBetween(LocalDate start, LocalDate end);
    List<Member> findByPaymentsIsEmpty(); // Members with no payments
}
