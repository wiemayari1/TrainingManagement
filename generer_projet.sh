#!/bin/bash

OUTPUT="projet_complet.txt"

echo "========================================" > "$OUTPUT"
echo "PROJET : TrainingManagementApp" >> "$OUTPUT"
echo "Date : $(date)" >> "$OUTPUT"
echo "========================================" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Fonction pour ajouter un fichier avec séparateur
add_file() {
    local file="$1"
    echo "" >> "$OUTPUT"
    echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" >> "$OUTPUT"
    echo "FICHIER : $file" >> "$OUTPUT"
    echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
}

# Backend : fichiers Java
echo "=== BACKEND (Java) ===" >> "$OUTPUT"
find backend/src -type f -name "*.java" | sort | while read -r f; do
    add_file "$f"
done

# Backend : resources
echo "=== BACKEND (Resources) ===" >> "$OUTPUT"
find backend/src/main/resources -type f \( -name "*.properties" -o -name "*.yml" -o -name "*.yaml" -o -name "*.xml" \) | sort | while read -r f; do
    add_file "$f"
done

# Backend : pom.xml
echo "=== BACKEND (Maven) ===" >> "$OUTPUT"
add_file "backend/pom.xml"

# Frontend : JS/JSX/CSS
echo "=== FRONTEND (React) ===" >> "$OUTPUT"
find frontend/src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | sort | while read -r f; do
    add_file "$f"
done

# Base de données
echo "=== BASE DE DONNEES ===" >> "$OUTPUT"
find db -type f -name "*.sql" | sort | while read -r f; do
    add_file "$f"
done

# README
if [ -f "README.md" ]; then
    echo "=== DOCUMENTATION ===" >> "$OUTPUT"
    add_file "README.md"
fi

echo "Fichier généré : $OUTPUT"
echo "Taille : $(wc -l < "$OUTPUT") lignes"
