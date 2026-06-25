# Tao file .env tu cau hinh hien tai (chi chay tren may dev, khong commit .env)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (Test-Path .env) {
  Write-Host ".env da ton tai, bo qua."
  exit 0
}

$yml = Get-Content "backend\src\main\resources\application.yml" -Raw

function Get-YmlValue($pattern) {
  if ($yml -match $pattern) { return $Matches[1].Trim('"') }
  return ""
}

$dbUrl = Get-YmlValue 'url:\s+"([^"]+)"'
$dbUser = Get-YmlValue 'username:\s+(\S+)'
$dbPass = Get-YmlValue 'password:\s+(\S+)'
$jwtKey = Get-YmlValue 'signerKey:\s+"([^"]+)"'
$cloudName = Get-YmlValue 'name:\s+(\S+)'
$cloudKey = Get-YmlValue 'key:\s+(\S+)'
$cloudSecret = Get-YmlValue 'secret:\s+(\S+)'
$speedSms = Get-YmlValue 'access_token:\s+"([^"]+)"'
$geminiKey = Get-YmlValue 'api-key:\s+(\S+)'

@(
  "SPRING_DATASOURCE_URL=$dbUrl"
  "SPRING_DATASOURCE_USERNAME=$dbUser"
  "SPRING_DATASOURCE_PASSWORD=$dbPass"
  "REACT_APP_API_URL=/phoneShop"
  "APP_CORS_ALLOWED_ORIGINS=http://maclenin.io.vn,https://maclenin.io.vn,http://www.maclenin.io.vn,https://www.maclenin.io.vn,http://localhost:3000"
  "GOOGLE_OAUTH2_REDIRECT_URI=http://maclenin.io.vn/phoneShop/login/oauth2/code/google"
  "JWT_SIGNER_KEY=$jwtKey"
  "CLOUDINARY_CLOUD_NAME=$cloudName"
  "CLOUDINARY_API_KEY=$cloudKey"
  "CLOUDINARY_API_SECRET=$cloudSecret"
  "SPEEDSMS_ACCESS_TOKEN=$speedSms"
  "SPRING_AI_OPENAI_API_KEY=$geminiKey"
  "MAIL_USERNAME="
  "MAIL_PASSWORD="
  "PAYOS_CLIENT_ID="
  "PAYOS_API_KEY="
  "PAYOS_CHECKSUM_KEY="
) | Set-Content -Encoding UTF8 .env

Write-Host "Da tao .env — kiem tra MAIL_* va PAYOS_* neu can."
