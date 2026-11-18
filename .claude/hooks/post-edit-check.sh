#!/usr/bin/env bash
# PostToolUse (Edit|Write) : vérifie le fichier modifié.
# - PHP (.php, .module, .inc, .install, .theme, .profile, .engine) : php -l + phpcs (si installé)
# - YAML (.yml, .yaml) : validation syntaxique
# Les outils PHP tournent dans Lando (pas de PHP sur l'hôte) ; si Lando est
# arrêté ou l'outil absent, la vérification est ignorée sans erreur.
# Exit 2 => le message stderr est renvoyé à Claude pour correction.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
FILE="$(jq -r '.tool_input.file_path // empty')"
[ -n "$FILE" ] && [ -f "$FILE" ] || exit 0

case "$FILE" in
  "$ROOT"/*) REL="${FILE#"$ROOT"/}" ;;
  *) exit 0 ;;
esac

ERRORS=""

lando_ready() {
  command -v lando >/dev/null 2>&1 || return 1
  docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^virgindrupal_appserver_1$'
}

case "$REL" in
  *.php|*.module|*.inc|*.install|*.theme|*.profile|*.engine)
    if lando_ready; then
      cd "$ROOT" || exit 0
      if ! OUT="$(lando php -l "/app/$REL" 2>&1)"; then
        ERRORS+="php -l : $OUT"$'\n'
      fi
      if [ -x "$ROOT/project/vendor/bin/phpcs" ]; then
        if ! OUT="$(lando ssh -s appserver -c "cd /app/project && vendor/bin/phpcs -q --no-colors --report=full /app/$REL" 2>&1)"; then
          ERRORS+="phpcs :"$'\n'"$OUT"$'\n'
        fi
      fi
    fi
    ;;
  *.yml|*.yaml)
    if command -v python3 >/dev/null 2>&1 && python3 -c 'import yaml' 2>/dev/null; then
      if ! OUT="$(python3 -I -c 'import sys,yaml
try:
    yaml.safe_load(open(sys.argv[1]))
except yaml.YAMLError as e:
    sys.exit(str(e))' "$FILE" 2>&1)"; then
        ERRORS+="YAML invalide : $OUT"$'\n'
      fi
    fi
    ;;
esac

if [ -n "$ERRORS" ]; then
  printf 'Vérification post-édition échouée pour %s :\n%s' "$REL" "$ERRORS" >&2
  exit 2
fi
exit 0
