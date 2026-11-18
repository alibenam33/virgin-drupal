# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Fresh Drupal 11 site (`drupal/recommended-project`, core 11.4.x, PHP 8.4) run locally with Lando. No custom modules, themes or contrib packages yet.

## Layout

- `.lando.yml` lives at the **repo root**; Lando mounts the repo root at `/app` in containers.
- The Composer project is in `project/` (so inside containers: `/app/project`). Run `composer` from `project/`.
- Webroot: `project/web` (core in `web/core`, contrib in `web/modules|themes|profiles/contrib`, custom code in `web/modules|themes|profiles/custom`, recipes in `project/recipes`). These paths are set by `installer-paths` in `project/composer.json`.
- Site settings: `project/web/sites/default/settings.php`. The DB credentials are hard-coded at the bottom and point at the Lando `database` service (`vd_database` / `vd_user`, host `database:3306`). Config sync directory: `sites/default/files/config_<hash>/sync`. The `settings.local.php` include is commented out.

## Commands (run via Lando)

```bash
lando start                      # appserver (PHP 8.4), MySQL 8.4, phpMyAdmin, MailHog
lando composer <args>            # run from project/ (e.g. lando composer require drupal/foo -d project)
lando drush <cmd>                # cr, cex, cim, updb, uli, ...
lando mysql                      # MySQL shell on vd_database
lando phpunit [path] [--filter testName]
lando phpcs | lando phpcbf | lando phpstan
lando info                       # URLs, incl. phpMyAdmin and MailHog
```

The database is exposed on host port 3310. Outgoing mail from the appserver is caught by MailHog.

## Known setup gaps (check before relying on tooling)

- **Tooling paths:** `.lando.yml` tooling calls `/app/vendor/bin/...` and `/app/phpunit.xml.dist`, but vendor is at `/app/project/vendor`. Those commands fail until the paths are fixed to `/app/project/...`.
- **Missing dev packages:** `drush/drush`, PHPUnit, PHP_CodeSniffer/Coder and PHPStan are **not** in `project/composer.json`, and the `phpcs.xml.dist`, `phpunit.xml.dist` and `phpstan.neon.dist` config files don't exist. Install with `composer require drush/drush` and `composer require --dev drupal/core-dev` (plus `phpstan/phpstan` and `mglaman/phpstan-drupal`) before using `lando drush`, `lando phpunit` and the others.
- **Recipe version:** the Lando recipe is `drupal10` but core is 11.x. Consider switching it to `drupal11`.
- **MySQL config:** `.lando/mysql.cnf` is an empty **directory**, not a file. The override it's meant to provide (dropping `expire_logs_days`, which MySQL 8.4 removed) isn't there yet.
