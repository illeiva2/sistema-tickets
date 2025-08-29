const fs = require('fs');
const path = require('path');

console.log('🚀 Starting workspace dependency copy script...');
console.log('Current directory:', __dirname);

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Función para copiar archivos específicos de un paquete
function copyPackageFiles(packageName, sourceDir, targetDir) {
  const packagePath = path.resolve(__dirname, sourceDir);
  const targetPath = path.resolve(__dirname, targetDir);

  console.log(`Copying ${packageName} from ${packagePath} to ${targetPath}`);
  console.log(`Source exists: ${fs.existsSync(packagePath)}`);

  // Copiar el directorio src completo
  const srcPath = path.join(packagePath, 'src');
  console.log(`Source src path: ${srcPath}, exists: ${fs.existsSync(srcPath)}`);
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, path.join(targetPath, 'src'));
    console.log(`✅ Copied src directory`);
  } else {
    console.log(`❌ Source src directory not found`);
  }

  // Copiar package.json si existe
  const packageJsonPath = path.join(packagePath, 'package.json');
  console.log(`Package.json path: ${packageJsonPath}, exists: ${fs.existsSync(packageJsonPath)}`);
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, path.join(targetPath, 'package.json'));
    console.log(`✅ Copied package.json`);
  }

  // Copiar archivos compilados si existen
  const distPath = path.join(packagePath, 'dist');
  console.log(`Dist path: ${distPath}, exists: ${fs.existsSync(distPath)}`);
  if (fs.existsSync(distPath)) {
    copyDir(distPath, path.join(targetPath, 'dist'));
    console.log(`✅ Copied dist directory`);
  }

  console.log(`✅ ${packageName} copied successfully`);
}

// Crear directorio node_modules/@forzani si no existe
const forzaniDir = path.resolve(__dirname, 'node_modules', '@forzani');
if (!fs.existsSync(forzaniDir)) {
  fs.mkdirSync(forzaniDir, { recursive: true });
}

// Copiar paquetes del workspace
try {
  copyPackageFiles('@forzani/ui', '../../../packages/ui', 'node_modules/@forzani/ui');
  copyPackageFiles('@forzani/types', '../../../packages/types', 'node_modules/@forzani/types');
  copyPackageFiles('@forzani/config', '../../../packages/config', 'node_modules/@forzani/config');

  console.log('🎉 All workspace dependencies copied successfully!');
} catch (error) {
  console.error('❌ Error copying workspace dependencies:', error);
  process.exit(1);
}
