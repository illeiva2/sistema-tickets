const fs = require('fs');
const path = require('path');

// Crear directorio dist/api si no existe
const apiDistDir = path.join(__dirname, '../dist/api');
if (!fs.existsSync(apiDistDir)) {
  fs.mkdirSync(apiDistDir, { recursive: true });
}

// Copiar archivo api/index.ts a dist/api/index.ts
const sourceFile = path.join(__dirname, '../src/api/index.ts');
const destFile = path.join(__dirname, '../dist/api/index.ts');

if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ API file copied to dist/api/index.ts');
} else {
  console.log('⚠️  Source API file not found, creating minimal export');
  
  // Crear un archivo de exportación mínimo si no existe el original
  const minimalExport = `import { app } from "../index";

// Exportar la app para Vercel (sin app.listen)
export default app;
`;
  
  fs.writeFileSync(destFile, minimalExport);
  console.log('✅ Created minimal API export file');
}

console.log('🚀 API build completed!');
