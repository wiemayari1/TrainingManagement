package com.isi.gf.config;

import com.isi.gf.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    // ✅ FIX 3 — CORS depuis variable d'environnement
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsRaw;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ── CORS ─────────────────────────────────────────────────────
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ── CSRF désactivé (API stateless JWT) ───────────────────────
                .csrf(csrf -> csrf.disable())

                // ── Sessions stateless ────────────────────────────────────────
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ FIX 4 — Headers de sécurité HTTP
                .headers(headers -> headers
                        // Empêche le clickjacking
                        .frameOptions(fo -> fo.deny())
                        // Empêche le sniffing de type MIME
                        .contentTypeOptions(cto -> {})
                        // XSS protection navigateur
                        .xssProtection(xss -> {})
                        // ✅ HSTS : force HTTPS (activer uniquement en prod avec vrai TLS)
                        // .httpStrictTransportSecurity(hsts -> hsts
                        //     .includeSubDomains(true)
                        //     .maxAgeInSeconds(31536000))
                        // Referrer policy : ne pas leaker l'URL dans les requêtes externes
                        .referrerPolicy(rp ->
                                rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Content-Security-Policy
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives(
                                        "default-src 'self'; " +
                                                "script-src 'self'; " +
                                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                                "font-src 'self' https://fonts.gstatic.com; " +
                                                "img-src 'self' data:; " +
                                                "connect-src 'self';"
                                ))
                )

                // ── Autorisations ─────────────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/stats/**").hasAnyRole("RESPONSABLE", "ADMIN")
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())

                // ✅ FIX 2 — Rate limit filter avant le filtre JWT
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ FIX 3 — Origines depuis l'environnement (plusieurs séparées par virgule)
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of(
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "Retry-After"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}