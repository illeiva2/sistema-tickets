-- Script para agregar el campo mustChangePassword a la tabla users
-- Ejecutar directamente en Supabase SQL Editor

-- Verificar si la columna ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'mustChangePassword'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE users ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Columna mustChangePassword agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna mustChangePassword ya existe';
    END IF;
END $$;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;