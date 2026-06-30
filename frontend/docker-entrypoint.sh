#!/bin/sh
set -e

DOMAIN="${APP_DOMAIN:-maclenin.io.vn}"
LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"
CERT="${LIVE_DIR}/fullchain.pem"
KEY="${LIVE_DIR}/privkey.pem"
CONF="/etc/nginx/conf.d/default.conf"

log() {
  echo "[frontend-entrypoint] $*" >&2
}

write_http_config() {
  sed "s/__DOMAIN__/${DOMAIN}/g" /etc/nginx/templates/default.http.conf > "$CONF"
}

write_ssl_config() {
  sed "s/__DOMAIN__/${DOMAIN}/g" /etc/nginx/templates/default.ssl.conf > "$CONF"
}

use_http() {
  log "Using HTTP config (port 80 only)"
  write_http_config
}

use_https() {
  log "Using HTTPS config for ${DOMAIN}"
  write_ssl_config
  if nginx -t 2>&1; then
    return 0
  fi
  log "WARN: HTTPS config failed nginx -t, falling back to HTTP"
  use_http
}

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  use_https
else
  log "No cert at ${CERT} (or missing privkey) — HTTP only"
  use_http
fi

log "Starting nginx..."
exec nginx -g 'daemon off;'
