# 🚀 Script de Despliegue Automático - Sistema de Tickets (PowerShell)
# Uso: .\scripts\deploy.ps1 [api|web|both]

param(
    [Parameter(Position=0)]
    [ValidateSet("api", "web", "both", "status", "help")]
    [string]$Command = "help"
)

# Configuración de colores
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Función para logging
function Write-Log {
    param([string]$Message, [string]$Color = $White)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $Red
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Log "[SUCCESS] $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $Yellow
}

# Verificar que estemos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error "Debes ejecutar este script desde la raíz del proyecto"
}

# Verificar que Vercel CLI esté instalado
try {
    $null = Get-Command vercel -ErrorAction Stop
} catch {
    Write-Error "Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
}

# Función para desplegar API
function Deploy-API {
    Write-Log "🔧 Desplegando API..." $Blue
    
    Set-Location "apps/api"
    
    # Verificar que exista vercel.json
    if (-not (Test-Path "vercel.json")) {
        Write-Error "vercel.json no encontrado en apps/api/"
    }
    
    # Build del proyecto
    Write-Log "📦 Construyendo API..." $Blue
    npm run build
    
    # Desplegar en Vercel
    Write-Log "🚀 Desplegando en Vercel..." $Blue
    vercel --prod --yes
    
    Write-Success "✅ API desplegada exitosamente"
    Set-Location "../.."
}

# Función para desplegar Frontend
function Deploy-Web {
    Write-Log "🌐 Desplegando Frontend..." $Blue
    
    Set-Location "apps/web"
    
    # Verificar que exista vercel.json
    if (-not (Test-Path "vercel.json")) {
        Write-Error "vercel.json no encontrado en apps/web/"
    }
    
    # Build del proyecto
    Write-Log "📦 Construyendo Frontend..." $Blue
    npm run build
    
    # Desplegar en Vercel
    Write-Log "🚀 Desplegando en Vercel..." $Blue
    vercel --prod --yes
    
    Write-Success "✅ Frontend desplegado exitosamente"
    Set-Location "../.."
}

# Función para desplegar ambos
function Deploy-Both {
    Write-Log "🔄 Desplegando API y Frontend..." $Blue
    
    Deploy-API
    Deploy-Web
    
    Write-Success "✅ Despliegue completo exitoso"
}

# Función para verificar estado
function Check-Status {
    Write-Log "📊 Verificando estado del despliegue..." $Blue
    
    # Verificar API
    if (Test-Path "apps/api/.vercel") {
        Write-Log "✅ API configurada para Vercel" $Green
    } else {
        Write-Warning "⚠️  API no configurada para Vercel"
    }
    
    # Verificar Frontend
    if (Test-Path "apps/web/.vercel") {
        Write-Log "✅ Frontend configurado para Vercel" $Green
    } else {
        Write-Warning "⚠️  Frontend no configurado para Vercel"
    }
    
    # Verificar variables de entorno
    Write-Log "🔍 Verificando variables de entorno..." $Blue
    
    Set-Location "apps/api"
    try {
        $envResult = vercel env ls 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Variables de entorno configuradas en API"
        } else {
            Write-Warning "⚠️  Variables de entorno no configuradas en API"
        }
    } catch {
        Write-Warning "⚠️  Variables de entorno no configuradas en API"
    }
    Set-Location "../.."
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "🚀 Script de Despliegue - Sistema de Tickets" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso: .\scripts\deploy.ps1 [comando]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Comandos:" -ForegroundColor $White
    Write-Host "  api     - Desplegar solo la API" -ForegroundColor $Yellow
    Write-Host "  web     - Desplegar solo el Frontend" -ForegroundColor $Yellow
    Write-Host "  both    - Desplegar API y Frontend" -ForegroundColor $Yellow
    Write-Host "  status  - Verificar estado del despliegue" -ForegroundColor $Yellow
    Write-Host "  help    - Mostrar esta ayuda" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor $White
    Write-Host "  .\scripts\deploy.ps1 api      # Desplegar solo API" -ForegroundColor $Yellow
    Write-Host "  .\scripts\deploy.ps1 both     # Desplegar todo" -ForegroundColor $Yellow
    Write-Host "  .\scripts\deploy.ps1 status   # Verificar estado" -ForegroundColor $Yellow
}

# Función principal
function Main {
    Write-Log "🚀 Iniciando despliegue del Sistema de Tickets..." $Blue
    
    switch ($Command) {
        "api" {
            Deploy-API
        }
        "web" {
            Deploy-Web
        }
        "both" {
            Deploy-Both
        }
        "status" {
            Check-Status
        }
        "help" {
            Show-Help
        }
        default {
            Show-Help
        }
    }
}

# Ejecutar función principal
Main
