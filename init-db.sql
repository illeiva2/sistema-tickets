-- Script de inicialización para la base de datos local
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear la base de datos si no existe (aunque ya se crea con POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS empresa_tickets;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos empresa_tickets inicializada correctamente';
END $$;