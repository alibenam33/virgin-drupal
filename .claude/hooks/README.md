# Hooks

Les hooks sont déclarés dans `.claude/settings.json` et exécutés par Claude Code
(chemins résolus via `$CLAUDE_PROJECT_DIR`). Ils reçoivent l’appel d’outil en
JSON sur stdin ; un code de sortie 2 renvoie le message stderr à Claude.

| Événement | Script | Rôle |
|---|---|---|
| `PreToolUse` (Edit, Write, NotebookEdit) | `protect-paths.sh` | Bloque l’écriture dans `project/web/core`, `project/vendor`, le contrib, `project/web/libraries`, `docs/files/`, `.lando.yml`, `.lando/` |
| `PostToolUse` (Edit, Write) | `post-edit-check.sh` | `php -l` et `phpcs` (Drupal, DrupalPractice) sur les fichiers PHP, validation syntaxique des YAML |

Notes :

- Pas de PHP sur l’hôte : les contrôles PHP passent par Lando et sont ignorés si
  le conteneur `virgindrupal_appserver_1` est arrêté.
- `phpcs` n’est lancé que si `project/vendor/bin/phpcs` existe.
- La validation YAML utilise `python3` + PyYAML sur l’hôte.
- Les journaux éventuels (`*.log`) de ce dossier sont ignorés par git.
- Pistes : `phpstan` sur les fichiers modifiés, `eslint`/`stylelint` pour le thème.
