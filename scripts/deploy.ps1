# deploy.ps1 — Build locally and push to ghcr.io, then deploy to VPS
# Usage: .\scripts\deploy.ps1
# Requirements: docker login ghcr.io -u jefryarianto --password-stdin

param(
    [string]$Service = "all",   # "web-admin", "api", or "all"
    [string]$Tag = "latest"
)

$REGISTRY = "ghcr.io/jefryarianto"
$PROJECT_ROOT = $PSScriptRoot + "\.."
$API_URL = "https://api.ths-thm.cloud/api/v1"

function Build-And-Push {
    param([string]$Name, [string]$Dockerfile, [hashtable]$BuildArgs = @{})

    $Image = "$REGISTRY/ths-thm-$Name`:$Tag"
    Write-Host "`n==> Building $Image ..." -ForegroundColor Cyan

    $Args = @("build", "-f", $Dockerfile, "-t", $Image)
    foreach ($key in $BuildArgs.Keys) {
        $Args += "--build-arg"
        $Args += "$key=$($BuildArgs[$key])"
    }
    $Args += $PROJECT_ROOT

    & docker @Args
    if ($LASTEXITCODE -ne 0) { Write-Host "Build failed for $Name" -ForegroundColor Red; exit 1 }

    Write-Host "==> Pushing $Image ..." -ForegroundColor Cyan
    docker push $Image
    if ($LASTEXITCODE -ne 0) { Write-Host "Push failed for $Name" -ForegroundColor Red; exit 1 }

    Write-Host "==> Done: $Image" -ForegroundColor Green
}

# Build services
if ($Service -eq "web-admin" -or $Service -eq "all") {
    Build-And-Push -Name "web-admin" `
        -Dockerfile "$PROJECT_ROOT\apps\web-admin\Dockerfile" `
        -BuildArgs @{ NEXT_PUBLIC_API_URL = $API_URL }
}

if ($Service -eq "api" -or $Service -eq "all") {
    Build-And-Push -Name "api" `
        -Dockerfile "$PROJECT_ROOT\apps\api\Dockerfile"
}

Write-Host "`n==> All images pushed. Now run on VPS:" -ForegroundColor Yellow
Write-Host "docker pull $REGISTRY/ths-thm-web-admin:$Tag" -ForegroundColor White
Write-Host "docker pull $REGISTRY/ths-thm-api:$Tag" -ForegroundColor White
Write-Host "docker compose -f infra/docker/docker-compose.dokploy.yml up -d" -ForegroundColor White
