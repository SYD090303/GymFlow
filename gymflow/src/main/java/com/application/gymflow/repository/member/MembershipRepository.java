package com.application.gymflow.repository.member;

import com.application.gymflow.model.member.Member;
import com.application.gymflow.model.member.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByMember(Member member);
}