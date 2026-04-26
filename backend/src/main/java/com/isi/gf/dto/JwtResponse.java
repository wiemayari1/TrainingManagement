package com.isi.gf.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Integer id;
    private String username;
    private String email;
    private String role;
    /** Indique si l'utilisateur doit changer son mot de passe (première connexion) */
    private Boolean firstLogin;

    public JwtResponse(String accessToken, Integer id, String username, String email, String role, Boolean firstLogin) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.firstLogin = firstLogin != null ? firstLogin : false;
    }
}
