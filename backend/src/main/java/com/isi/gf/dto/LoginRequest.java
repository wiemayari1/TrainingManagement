package com.isi.gf.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String login;  // pour compatibilité ancien frontend
    
    public String getUsername() {
        if (username != null && !username.isEmpty()) {
            return username;
        }
        return login;
    }

    @NotBlank
    private String password;
}
