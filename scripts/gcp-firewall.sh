#!/usr/bin/env bash
# Mo firewall GCP cho web app — chay tren may co gcloud CLI da login
set -euo pipefail

PROJECT="${GCP_PROJECT:-}"
INSTANCE="${GCP_INSTANCE:-instance-mobile}"
ZONE="${GCP_ZONE:-asia-east1-c}"
NETWORK_TAG="${NETWORK_TAG:-http-server}"

if [ -n "$PROJECT" ]; then
  gcloud config set project "$PROJECT"
fi

echo "==> Tao firewall rule: allow-http-80..."
gcloud compute firewall-rules create allow-http-80 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags="$NETWORK_TAG" \
  2>/dev/null || echo "Rule allow-http-80 da ton tai hoac loi — kiem tra Console."

echo "==> Tao firewall rule: allow-https-443..."
gcloud compute firewall-rules create allow-https-443 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags="$NETWORK_TAG" \
  2>/dev/null || echo "Rule allow-https-443 da ton tai hoac loi — kiem tra Console."

echo "==> Gan network tag '$NETWORK_TAG' cho VM $INSTANCE..."
gcloud compute instances add-tags "$INSTANCE" \
  --zone="$ZONE" \
  --tags="$NETWORK_TAG"

echo "==> Xong. Kiem tra: http://maclenin.io.vn/ sau khi deploy Docker."
