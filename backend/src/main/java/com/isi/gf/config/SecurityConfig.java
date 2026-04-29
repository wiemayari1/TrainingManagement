package com.isi.gf.config;

import com.isi.gf.service.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
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

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Profil actif (dev / prod). Injecter via -Dspring.profiles.active=prod
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt cost=12 — bon équilibre sécurité/performance
        return new BCryptPasswordEncoder(12);
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .headers(headers -> headers
                        .frameOptions(fo -> fo.deny())
                        .contentTypeOptions(ct -> {})
                        .httpStrictTransportSecurity(hsts -> hsts
                                .maxAgeInSeconds(31536000)
                                .includeSubDomains(true)
                                .preload(true))
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; " +
                                                "script-src 'self'; " +
                                                "style-src 'self' 'unsafe-inline'; " +
                                                "img-src 'self' data:; " +
                                                "font-src 'self'; " +
                                                "connect-src 'self'; " +
                                                "frame-ancestors 'none'; " +
                                                "base-uri 'self'; " +
                                                "form-action 'self'"
                                ))
                        .referrerPolicy(rp -> rp.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(pp -> pp.policy(
                                "geolocation=(), camera=(), microphone=(), payment=()"
                        ))
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setContentType("application/json");
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.getWriter().write("{\"message\":\"Non authentifié\",\"success\":false}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setContentType("application/json");
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.getWriter().write("{\"message\":\"Accès refusé\",\"success\":false}");
                        })
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/stats/**").hasAnyRole("RESPONSABLE", "ADMIN")
                        // ROLE_RESPONSABLE ne peut accéder qu'aux stats
                        .requestMatchers("/formations/**", "/participants/**",
                                "/formateurs/**", "/inscriptions/**",
                                "/domaines/**", "/structures/**",
                                "/profils/**", "/employeurs/**")
                        .hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new RateLimitFilter(), JwtAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        String origin = frontendUrl.trim();
        boolean isDev = "dev".equalsIgnoreCase(activeProfile);

        if (isDev) {
            // En dev : accepter l'URL configurée + localhost:3000
            configuration.setAllowedOrigins(List.of(origin, "http://localhost:3000"));
        } else {
            // En PRODUCTION : seulement l'URL exacte configurée, JAMAIS localhost
            configuration.setAllowedOrigins(List.of(origin));
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(1800L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}