# Script de PowerShell para configurar recursos en Azure
# Requiere Azure CLI instalado: winget install -e --id Microsoft.AzureCLI

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "sistema-tickets-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$true)]
    [string]$DatabasePassword
)

Write-Host "🚀 Configurando recursos en Azure..." -ForegroundColor Green

# Login a Azure
Write-Host "`n1. Iniciando sesión en Azure..." -ForegroundColor Cyan
az login

# Crear grupo de recursos
Write-Host "`n2. Creando grupo de recursos..." -ForegroundColor Cyan
az group create --name $ResourceGroupName --location $Location

# Crear PostgreSQL Flexible Server
Write-Host "`n3. Creando base de datos PostgreSQL..." -ForegroundColor Cyan
$dbServerName = "$ResourceGroupName-db"
az postgres flexible-server create `
  --resource-group $ResourceGroupName `
  --name $dbServerName `
  --location $Location `
  --admin-user postgres `
  --admin-password $DatabasePassword `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 15 `
  --public-access 0.0.0.0

# Crear base de datos
Write-Host "`n4. Creando base de datos..." -ForegroundColor Cyan
az postgres flexible-server db create `
  --resource-group $ResourceGroupName `
  --server-name $dbServerName `
  --database-name empresa_tickets

# Crear App Service Plan (Free Tier)
Write-Host "`n5. Creando App Service Plan..." -ForegroundColor Cyan
az appservice plan create `
  --name "$ResourceGroupName-plan" `
  --resource-group $ResourceGroupName `
  --sku FREE `
  --is-linux

# Crear Web App para API
Write-Host "`n6. Creando Web App para API..." -ForegroundColor Cyan
$webAppName = "$ResourceGroupName-api"
az webapp create `
  --resource-group $ResourceGroupName `
  --plan "$ResourceGroupName-plan" `
  --name $webAppName `
  --runtime "NODE:20-lts"

# Configurar variables de entorno
Write-Host "`n7. Configurando variables de entorno..." -ForegroundColor Cyan
$dbConnectionString = "postgresql://postgres:$DatabasePassword@$dbServerName.postgres.database.azure.com:5432/empresa_tickets?sslmode=require"

az webapp config appsettings set `
  --resource-group $ResourceGroupName `
  --name $webAppName `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    DATABASE_URL="$dbConnectionString" `
    JWT_SECRET="$(New-Guid)" `
    FRONTEND_URLS="https://$ResourceGroupName-web.azurestaticapps.net"

Write-Host "`n✅ Recursos creados exitosamente!" -ForegroundColor Green
Write-Host "`n📋 Información importante:" -ForegroundColor Yellow
Write-Host "  - Grupo de recursos: $ResourceGroupName" -ForegroundColor White
Write-Host "  - Base de datos: $dbServerName.postgres.database.azure.com" -ForegroundColor White
Write-Host "  - Web App API: https://$webAppName.azurewebsites.net" -ForegroundColor White
Write-Host "`n🔐 Guarda estas credenciales:" -ForegroundColor Red
Write-Host "  - Database Password: $DatabasePassword" -ForegroundColor White
Write-Host "  - Connection String: $dbConnectionString" -ForegroundColor White

