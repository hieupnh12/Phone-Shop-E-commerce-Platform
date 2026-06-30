#!/usr/bin/env bash
# Chay tren GCP VM lan dau de lay SSL Let's Encrypt
# Yeu cau: DNS maclenin.io.vn -> 35.221.155.202, firewall mo port 80/443
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Chua co file .env"
  exit 1
fi

set -a
# Chi load bien can thiet — tranh loi khi .env co gia tri co khoang trang
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|\#*) continue ;;
    APP_DOMAIN=*|CERTBOT_EMAIL=*|DOCKERHUB_USER=*|IMAGE_TAG=*)
      key="${line%%=*}"
      val="${line#*=}"
      val="${val%\"}"; val="${val#\"}"
      export "$key=$val"
      ;;
  esac
done < .env
set +a

DOMAIN="${APP_DOMAIN:-maclenin.io.vn}"
EMAIL="${CERTBOT_EMAIL:-}"

if [ -z "$EMAIL" ]; then
  echo "Dat CERTBOT_EMAIL trong .env (email nhan thong bao Let's Encrypt)"
  exit 1
fi

echo "==> Khoi dong stack (HTTP truoc khi co SSL)..."
docker compose -f docker-compose.prod.yml up -d redis backend frontend

echo "==> Xin chung chi Let's Encrypt cho ${DOMAIN}..."
docker compose -f docker-compose.prod.yml --profile manual run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.${DOMAIN}" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

echo "==> Khoi dong lai frontend (HTTPS) + certbot renew..."
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend

echo ""
echo "==> SSL da cai. Kiem tra:"
echo "    https://${DOMAIN}/"
echo "    https://${DOMAIN}/phoneShop/"
echo ""
echo "Cap nhat Google OAuth redirect URI:"
echo "    https://${DOMAIN}/phoneShop/login/oauth2/code/google"
