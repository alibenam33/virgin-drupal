# Conventions backend

- Les modules custom vivent dans `project/web/modules/custom`.
- La configuration exportée vit dans `project/config/sync` (`lando drush cex` / `cim`).
- Les services sont déclarés dans `*.services.yml` et injectés par le conteneur.
- Les routes sont déclarées dans `*.routing.yml`.
- Les permissions sont déclarées dans `*.permissions.yml`.
- Les schémas de configuration sont déclarés dans `<module>/config/schema/*.schema.yml`.
- Les tests sont placés sous `<module>/tests/src/{Unit,Kernel,Functional}/**`.
- Les dépendances externes sont ajoutées via Composer, jamais dans `vendor/`.
- Les modifications de schéma de données doivent être accompagnées d’une
  stratégie de mise à jour ou de migration.
## Commandes de vérification (Lando)

| Vérification | Commande |
|---|---|
| Syntaxe PHP | `lando php -l <fichier>` |
| Standards Drupal | `lando phpcs` |
| Analyse statique | `lando phpstan` |
| Tests | `lando phpunit` |
| État de la config | `lando drush config:status` |
| Vider les caches | `lando drush cr` |

PHPUnit, PHPCS et PHPStan ne sont pas encore installés (pas de `require-dev`,
pas de `phpunit.xml.dist`, `phpcs.xml.dist`, `phpstan.neon.dist`), et les
commandes `lando phpunit|phpcs|phpstan` de `.lando.yml` pointent vers
`/app/vendor/bin` au lieu de `/app/project/vendor/bin`. À régulariser avec
l’accord de l’utilisateur.
