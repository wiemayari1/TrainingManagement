package com.isi.gf.model;

/**
 * Rôles selon le cahier des charges :
 * - ROLE_USER : Simple utilisateur (gère formateurs, formations, participants)
 * - ROLE_RESPONSABLE : Responsable du centre (consultation statistiques uniquement)
 * - ROLE_ADMIN : Administrateur (accès illimité + gestion utilisateurs/domaines/structures)
 */
public enum RoleType {
    ROLE_USER,
    ROLE_RESPONSABLE,
    ROLE_ADMIN
}
