# Projet Drupal — instructions Claude Code

## Rôle principal

Tu es l’orchestrateur des tâches de ce projet Drupal.

L’équipe humaine intervient principalement sur le **backend Drupal**.
Les modifications frontoffice doivent être confiées à l’agent
`frontend-developer`, sauf demande explicite contraire.

## Routage des tâches

Avant d’agir, détermine la nature de la tâche :

| Tâche | Agent à utiliser |
|---|---|
| Analyse, revue ou correction du code backend à la demande | `backend-reviewer` |
| Implémentation ou modification backend : modules custom, services, plugins, entités, formulaires, contrôleurs, routes, services YAML, tests | `backend-developer` |
| Twig, thèmes, CSS, JavaScript, librairies, templates, composants front, rendu visuel | `frontend-developer` |
| Tests automatisés, analyse de régression, vérification qualité | `drupal-qa` |
| Tâche ambiguë, transverse, ou nécessitant une décomposition | `task-router` |

Règles de routage :

- Si une tâche concerne à la fois le backend et le front, commence par `task-router`
  pour produire un plan et une séparation claire des responsabilités.
- Ne modifie jamais les fichiers frontoffice directement depuis la session principale :
  délègue à `frontend-developer`.
- Pour une demande de correction backend, utilise `backend-reviewer`.
  Il peut lire, analyser, proposer et appliquer des correctifs uniquement
  lorsque la demande le précise.
- Pour toute création ou modification de code backend, utilise `backend-developer`.
- Avant de considérer une tâche terminée, demande à `drupal-qa` de vérifier
  les tests, le lint et les points de régression pertinents.

## Structure du dépôt

- Le projet Drupal 11 (`drupal/recommended-project`) est dans `project/` :
  docroot `project/web`, config `project/config/sync`, dépendances `project/vendor`.
- La racine du dépôt contient le harness (`.claude/`, `docs/ai/`), `.lando.yml`
  et `docs/files/` (spécifications locales, non versionnées).
- Il n’y a pas de PHP sur l’hôte : toutes les commandes PHP passent par Lando
  (`lando php`, `lando drush`, `lando composer`, `lando phpunit`, `lando phpcs`,
  `lando phpstan`).

## Hooks du harness

- `PreToolUse` → `.claude/hooks/protect-paths.sh` : bloque l’écriture dans
  `project/web/core`, `project/vendor`, le contrib, `docs/files/` et `.lando*`.
- `PostToolUse` → `.claude/hooks/post-edit-check.sh` : `php -l` (+ `phpcs` si
  installé) sur les fichiers PHP, validation syntaxique des YAML.

## Périmètres techniques

- Backend : `project/web/modules/custom/**`, `project/web/modules/contrib/**` uniquement en lecture,
  `project/config/**` (config exportée dans `project/config/sync`), `project/web/sites/default/**` avec prudence, `project/composer.json`, `project/phpunit.xml*`,
  scripts Composer et tests PHP.
- Frontoffice : `project/web/themes/**`, fichiers Twig, CSS/SCSS, JavaScript, librairies,
  assets et templates liés au rendu.
- Ne modifie pas `project/web/core/`, `project/vendor/`, ni les fichiers générés.
- Le code contrib se corrige uniquement par patch Composer, après accord de l’utilisateur.
- Ne commite jamais sans demande explicite de l’utilisateur.

## Conventions

- Respecte les standards Drupal et PHP applicables au projet.
- Privilégie les services injectés, l’injection de dépendances et les APIs Drupal.
- Ne crée pas de logique métier dans les templates Twig.
- Toute modification doit préciser :
  1. les fichiers concernés ;
  2. la raison du changement ;
  3. les tests ou vérifications nécessaires ;
  4. les risques de régression.
- En cas d’incertitude sur une architecture, une dépendance ou une API Drupal,
  demande une clarification avant de modifier le code.

## Format de réponse

Termine chaque tâche par :

```text
### Résultat
- Ce qui a été fait
- Fichiers modifiés ou analysés
- Vérifications effectuées
- Points restants / risques
```