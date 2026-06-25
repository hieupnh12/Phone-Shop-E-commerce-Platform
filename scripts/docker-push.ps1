#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Get-EnvValue($key) {
    foreach ($line in Get-Content .env) {
        if ($line -match "^\s*$key=(.*)$") { return $Matches[1].Trim() }
    }
    return ""
}

$user = Get-EnvValue "DOCKERHUB_USER"
if (-not $user) { $user = "hieupnh12" }
$tag = Get-EnvValue "IMAGE_TAG"
if (-not $tag) { $tag = "latest" }

Write-Host "==> Docker login (hub.docker.com) - user: $user"
docker login

Write-Host "==> Build images..."
docker compose build

Write-Host "==> Push to Docker Hub..."
docker push "${user}/group1-backend:${tag}"
docker push "${user}/group1-frontend:${tag}"

Write-Host ""
Write-Host "==> Da push:"
Write-Host "    ${user}/group1-backend:${tag}"
Write-Host "    ${user}/group1-frontend:${tag}"
Write-Host ""
Write-Host 'Tren GCP VM chi can:'
Write-Host '  scp docker-compose.prod.yml .env USER@35.221.155.202:~/group_1/'
Write-Host '  Truy cap: http://maclenin.io.vn/'
Write-Host '  docker compose -f docker-compose.prod.yml pull'
Write-Host '  docker compose -f docker-compose.prod.yml up -d'
