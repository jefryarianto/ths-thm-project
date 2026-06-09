# THS-THM Build & Push to Docker Hub
# ====================================
# Usage: .\infra\docker\scripts\build-push.ps1
# Requires: Docker Desktop running, logged in to Docker Hub (docker login)

param(
    [string]$DockerHubUser = "jefryarianto",
    [string]$Tag = "latest",
    [string]$BuildArgs = "NEXT_PUBLIC_API_URL=https://api.ths-thm.cloud/api/v1"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host " THS-THM Build & Push to Docker Hub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "User: $DockerHubUser" -ForegroundColor Green
Write-Host "Tag:  $Tag" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$RepoRoot = (Get-Item "$PSScriptRoot\..\..\..").FullName
Set-Location $RepoRoot

Write-Host "`n[1/4] Building API image..." -ForegroundColor Yellow
docker build -f apps/api/Dockerfile -t $DockerHubUser/ths-thm-api:$Tag .
if ($LASTEXITCODE -ne 0) { throw "API build failed" }

Write-Host "`n[2/4] Building Web-Admin image..." -ForegroundColor Yellow
docker build -f apps/web-admin/Dockerfile --build-arg $BuildArgs -t $DockerHubUser/ths-thm-web-admin:$Tag .
if ($LASTEXITCODE -ne 0) { throw "Web-Admin build failed" }

Write-Host "`n[3/4] Pushing API image..." -ForegroundColor Yellow
docker push $DockerHubUser/ths-thm-api:$Tag
if ($LASTEXITCODE -ne 0) { throw "API push failed" }

Write-Host "`n[4/4] Pushing Web-Admin image..." -ForegroundColor Yellow
docker push $DockerHubUser/ths-thm-web-admin:$Tag
if ($LASTEXITCODE -ne 0) { throw "Web-Admin push failed" }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " Done! Images pushed:" -ForegroundColor Green
Write-Host "   $DockerHubUser/ths-thm-api:$Tag" -ForegroundColor Green
Write-Host "   $DockerHubUser/ths-thm-web-admin:$Tag" -ForegroundColor Green
Write-Host "`n Now run on VPS:" -ForegroundColor Green
Write-Host "   docker pull $DockerHubUser/ths-thm-api:$Tag" -ForegroundColor Green
Write-Host "   docker pull $DockerHubUser/ths-thm-web-admin:$Tag" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green