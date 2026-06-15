#!/usr/bin/env bash
# Configure Cloudflare DNS + redirect rules for teaching.palmyed.com
# Requires: CF_API_TOKEN with Zone.DNS Edit + Zone Rules Edit on palmyed.com
#
# Usage:
#   export CF_API_TOKEN="..."
#   ./scripts/configure-cloudflare.sh

set -euo pipefail

ZONE_NAME="${ZONE_NAME:-palmyed.com}"
API="https://api.cloudflare.com/client/v4"

if [[ -z "${CF_API_TOKEN:-}" ]]; then
  echo "Error: set CF_API_TOKEN (Zone.DNS + Zone Rules Edit for ${ZONE_NAME})" >&2
  exit 1
fi

cf_api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" "${API}${path}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

zone_id="$(cf_api GET "/zones?name=${ZONE_NAME}" | jq -r '.result[0].id // empty')"
if [[ -z "$zone_id" || "$zone_id" == "null" ]]; then
  echo "Error: could not find Cloudflare zone for ${ZONE_NAME}" >&2
  exit 1
fi
echo "Zone ${ZONE_NAME}: ${zone_id}"

# --- DNS: teaching CNAME → obidose.github.io ---
existing="$(cf_api GET "/zones/${zone_id}/dns_records?type=CNAME&name=teaching.${ZONE_NAME}" | jq -r '.result[0].id // empty')"
if [[ -n "$existing" && "$existing" != "null" ]]; then
  echo "Updating existing CNAME teaching.${ZONE_NAME}"
  cf_api PUT "/zones/${zone_id}/dns_records/${existing}" \
    --data '{"type":"CNAME","name":"teaching","content":"obidose.github.io","proxied":true}' \
    | jq -r '.success, .errors'
else
  echo "Creating CNAME teaching.${ZONE_NAME} → obidose.github.io"
  cf_api POST "/zones/${zone_id}/dns_records" \
    --data '{"type":"CNAME","name":"teaching","content":"obidose.github.io","proxied":true}' \
    | jq -r '.success, .errors'
fi

# --- Redirect rules (http_request_dynamic_redirect phase) ---
ruleset_id="$(cf_api GET "/zones/${zone_id}/rulesets/phases/http_request_dynamic_redirect/entrypoint" \
  | jq -r '.result.id // empty')"

rules_json='{
  "rules": [
    {
      "expression": "(http.request.uri.path eq \"/attend\") or starts_with(http.request.uri.path, \"/attend/\")",
      "description": "Redirect /attend to teaching.palmyed.com",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": { "value": "https://teaching.palmyed.com/" },
          "preserve_query_string": false
        }
      }
    },
    {
      "expression": "starts_with(http.request.uri.path, \"/teaching/qr\")",
      "description": "Redirect /teaching/qr to teaching.palmyed.com/qr/",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": { "value": "https://teaching.palmyed.com/qr/" },
          "preserve_query_string": true
        }
      }
    },
    {
      "expression": "starts_with(http.request.uri.path, \"/teaching/go\")",
      "description": "Redirect /teaching/go to teaching.palmyed.com",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": { "value": "https://teaching.palmyed.com/" },
          "preserve_query_string": true
        }
      }
    }
  ]
}'

if [[ -n "$ruleset_id" && "$ruleset_id" != "null" ]]; then
  echo "Updating redirect ruleset ${ruleset_id}"
  cf_api PUT "/zones/${zone_id}/rulesets/${ruleset_id}" \
    --data "$(jq -n --argjson rules "$(echo "$rules_json" | jq '.rules')" \
      '{name: "Teaching site redirects", kind: "zone", phase: "http_request_dynamic_redirect", rules: $rules}')" \
    | jq -r '.success, .errors'
else
  echo "Creating redirect ruleset"
  cf_api POST "/zones/${zone_id}/rulesets" \
    --data "$(jq -n --argjson rules "$(echo "$rules_json" | jq '.rules')" \
      '{name: "Teaching site redirects", kind: "zone", phase: "http_request_dynamic_redirect", rules: $rules}')" \
    | jq -r '.success, .errors'
fi

echo ""
echo "Done. Manual step still required in Cloudflare Zero Trust:"
echo "  Exclude teaching.palmyed.com from the Access app that protects palmyed.com"
echo ""
echo "After DNS propagates, enable Enforce HTTPS in GitHub Pages settings."
