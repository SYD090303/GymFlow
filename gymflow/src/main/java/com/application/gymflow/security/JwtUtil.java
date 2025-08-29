package com.application.gymflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for handling JWT generation, extraction, and validation.
 * <p>
 * Uses {@link Jwts} for building and parsing tokens.
 * The secret key is injected from application properties.
 * </p>
 */
@Component
public class JwtUtil {

    private final Key key;
    private final long jwtExpirationMs;

    /**
     * Constructs a JwtUtil instance with the provided secret and expiration.
     *
     * @param secret         Base64 encoded secret key for signing the JWT.
     * @param jwtExpirationMs Expiration time in milliseconds (default: 24h).
     */
    public JwtUtil(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms:86400000}") long jwtExpirationMs
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Generates a signed JWT token.
     *
     * @param username    The subject (typically user email).
     * @param extraClaims Additional claims to include in the token.
     * @return A signed JWT string.
     */
    public String generateToken(String username, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the username (subject) from the JWT.
     *
     * @param token JWT string.
     * @return The username (subject).
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts a specific claim using a resolver function.
     *
     * @param token    JWT string.
     * @param resolver Function to extract a claim from Claims.
     * @param <T>      Type of the claim.
     * @return Extracted claim value.
     */
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
        return resolver.apply(claims);
    }

    /**
     * Validates if the token belongs to the provided username and is not expired.
     *
     * @param token    JWT string.
     * @param username Expected username.
     * @return true if valid, false otherwise.
     */
    public boolean isTokenValid(String token, String username) {
        final String extracted = extractUsername(token);
        return extracted.equals(username) && !isTokenExpired(token);
    }

    /**
     * Checks if the token is expired.
     *
     * @param token JWT string.
     * @return true if expired, false otherwise.
     */
    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}
