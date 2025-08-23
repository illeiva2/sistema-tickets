#!/usr/bin/env bash
set -euo pipefail

# Requirements: gh CLI authenticated (GITHUB_TOKEN) and jq
# Usage: GITHUB_REPO=owner/repo ./infra/create-project.sh

if [[ -z "${GITHUB_REPO:-}" ]]; then
  echo "Set GITHUB_REPO=owner/repo" >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
CONFIG="$ROOT_DIR/infra/github-projects-setup.json"

if ! command -v gh >/dev/null; then
  echo "gh CLI is required" >&2; exit 1
fi
if ! command -v jq >/dev/null; then
  echo "jq is required" >&2; exit 1
fi

NAME=$(jq -r '.project.name' "$CONFIG")
OWNER="${GITHUB_REPO%%/*}"

# ✅ Crear Project
PROJECT_NUMBER=$(gh project create "$NAME" --owner "$OWNER" --title "$NAME" --format json | jq -r '.number')
echo "✅ Project creado: $NAME (#$PROJECT_NUMBER)"

# ✅ Agregar campos personalizados (Status y Prioridad)
gh project field-create $PROJECT_NUMBER --owner "$OWNER" --name "Status" --data-type SINGLE_SELECT --options "Pendiente,En Progreso,Hecho"
gh project field-create $PROJECT_NUMBER --owner "$OWNER" --name "Prioridad" --data-type SINGLE_SELECT --options "Alta,Media,Baja"

# ✅ Labels
jq -r '.labels[]' "$CONFIG" | while read -r label; do
  gh api repos/$GITHUB_REPO/labels -f name="$label" -f color=ededed -X POST >/dev/null 2>&1 || true
  echo "Etiqueta creada: $label"
done

# ✅ Milestones
jq -r '.milestones[].title' "$CONFIG" | while read -r title; do
  gh api repos/$GITHUB_REPO/milestones -f title="$title" -X POST >/dev/null 2>&1 || true
  echo "Milestone creado: $title"
done

# ✅ Issues + agregar al Project
jq -c '.issuesSeed[]' "$CONFIG" | while read -r item; do
  TITLE=$(jq -r '.title' <<<"$item")
  BODY=$(jq -r '.body // ""' <<<"$item")
  LABELS=$(jq -r '.labels | join(",")' <<<"$item")
  ISSUE_JSON=$(gh api repos/$GITHUB_REPO/issues -f title="$TITLE" -f body="$BODY" -f labels="$LABELS")
  ISSUE_NUMBER=$(jq -r '.number' <<<"$ISSUE_JSON")
  echo "Issue #$ISSUE_NUMBER creado: $TITLE"
  gh project item-add $PROJECT_NUMBER --owner "$OWNER" --url "https://github.com/$GITHUB_REPO/issues/$ISSUE_NUMBER" >/dev/null
done