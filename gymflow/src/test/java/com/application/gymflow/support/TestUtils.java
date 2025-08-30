package com.application.gymflow.support;

import com.application.gymflow.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TestUtils {

    @Autowired
    private JwtUtil jwtUtil;

    public String bearerFor(String email, String role) {
        String token = jwtUtil.generateToken(email, Map.of("role", role, "uid", 1));
        return "Bearer " + token;
    }
}
