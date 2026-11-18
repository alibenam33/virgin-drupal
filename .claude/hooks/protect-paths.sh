#!/usr/bin/env bash
# PreToolUse (Edit|Write|NotebookEdit) : bloque l'écriture dans les zones
# interdites par CLAUDE.md (core, vendor, contrib, fichiers locaux sensibles).
# Exit 2 => l'outil est bloqué et la raison (stderr) est renvoyée à Claude.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
FILE="$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')"
[ -n "$FILE" ] || exit 0
REL="${FILE#"$ROOT"/}"

case "$REL" in
  project/web/core/*|project/vendor/*)
    echo "Bloqué : $REL est géré par Composer (core/vendor) et ne doit pas être modifié." >&2
    exit 2 ;;
  project/web/modules/contrib/*|project/web/themes/contrib/*|project/web/profiles/contrib/*|project/web/libraries/*)
    echo "Bloqué : $REL est du code contrib (lecture seule). Passer par un patch Composer (cweagans/composer-patches) après accord de l'utilisateur." >&2
    exit 2 ;;
  docs/files/*|.lando.yml|.lando/*)
    echo "Bloqué : $REL est local/sensible ; demande à l'utilisateur de le modifier lui-même." >&2
    exit 2 ;;
esac
exit 0
