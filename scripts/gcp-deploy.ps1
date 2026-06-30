#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

# Doc .env
function Get-EnvValue($key) {
    foreach ($line in Get-Content .env) {
        if ($line -match "^\s*$key=(.*)$") { return $Matches[1].Trim() }
    }
    return ""
}

$instance = Get-EnvValue "GCP_INSTANCE"
if (-not $instance) { $instance = "instance-mobile" }
$zone = Get-EnvValue "GCP_ZONE"
if (-not $zone) { $zone = "asia-east1-c" }
$remoteDir = Get-EnvValue "REMOTE_DIR"
if (-not $remoteDir) { $remoteDir = "/home/$((Get-EnvValue 'VPS_USER'))/group_1" }
if ($remoteDir -eq "/home//group_1") { $remoteDir = "~/group_1" }
$project = Get-EnvValue "GCP_PROJECT"

if (-not (Test-Path .env)) {
    Write-Error "Chua co file .env"
}

if ($project) {
    gcloud config set project $project
}

Write-Host "==> Upload code len $instance ($zone)..."
gcloud compute ssh $instance --zone=$zone --command="mkdir -p $remoteDir"

# Upload tung thu muc chinh (tranh upload node_modules/target)
$items = @(
    "docker-compose.yml", ".env", "backend", "frontend", "scripts", "deploy.sh"
)
foreach ($item in $items) {
    if (Test-Path $item) {
        gcloud compute scp --recurse $item "${instance}:${remoteDir}/" --zone=$zone
    }
}

Write-Host "==> Cai Docker (neu chua co) va build..."
$setupCmd = @"
set -e
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker `$USER
fi
cd $remoteDir
docker compose down 2>/dev/null || true
docker compose up -d --build
docker compose ps
"@

gcloud compute ssh $instance --zone=$zone --command=$setupCmd

Write-Host "    Web: http://maclenin.io.vn/"
Write-Host "    API: http://maclenin.io.vn/phoneShop/"
