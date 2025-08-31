package com.application.gymflow.config;

import com.application.gymflow.security.JwtAuthenticationFilter;
import com.application.gymflow.service.auth.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5153,http://127.0.0.1:5173,http://172.20.10.3:5174}")
    private String corsAllowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String corsAllowedMethods;

    @Value("${app.cors.allowed-headers:*}")
    private String corsAllowedHeaders;

    @Value("${app.cors.allow-credentials:true}")
    private boolean corsAllowCredentials;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                        // Swagger & OpenAPI endpoints
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Administrative endpoints (accessible only by OWNER)
                        .requestMatchers("/api/v1/admins/**").hasRole("OWNER")
                        .requestMatchers("/api/v1/jobs/**").hasRole("OWNER")

                        // User settings endpoints
                        .requestMatchers("/api/v1/users/me/**").authenticated()
                        .requestMatchers("/api/v1/users/**").hasRole("OWNER")

                        // Receptionist management endpoints (accessible only by OWNER)
                        .requestMatchers("/api/v1/receptionists/**").hasRole("OWNER")

                        // Member management + attendance endpoints
                        // Self-scope for any authenticated user
                        .requestMatchers("/api/v1/members/me").authenticated()
                        .requestMatchers("/api/v1/attendance/me").authenticated()
                        // Payments endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/member/*").hasAnyRole("OWNER", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/member/*").hasAnyRole("OWNER", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/member/*/between").hasAnyRole("OWNER", "RECEPTIONIST")
                        // Administrative member/attendance routes
                        .requestMatchers("/api/v1/members/**").hasAnyRole("OWNER", "RECEPTIONIST")
                        .requestMatchers("/api/v1/attendance/**").hasAnyRole("OWNER", "RECEPTIONIST")

                        // Notifications
                        .requestMatchers("/api/v1/notifications/owner").hasRole("OWNER")
                        .requestMatchers("/api/v1/notifications/me").hasRole("OWNER")
                        .requestMatchers("/api/v1/notifications/**").hasRole("OWNER")

                        // Any other API endpoints
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).toList();
    List<String> methods = Arrays.stream(corsAllowedMethods.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).toList();
    List<String> headers = Arrays.stream(corsAllowedHeaders.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).toList();
    configuration.setAllowedOrigins(origins);
    configuration.setAllowedMethods(methods);
    configuration.setAllowedHeaders(headers);
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(corsAllowCredentials);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }
}