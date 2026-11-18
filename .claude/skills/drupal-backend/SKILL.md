---
name: drupal-backend
description: Conventions et méthode pour développer, auditer et tester le backend Drupal de ce projet.
---

# Développement backend Drupal

## Avant de coder

- Identifie le module custom concerné.
- Vérifie les dépendances, services et configurations existants.
- Recherche les implémentations similaires dans `project/web/modules/custom`.
- Détermine si la fonctionnalité nécessite une entité, un plugin, un service,
  une queue, un formulaire, une route ou une commande Drush.

## Architecture

- Place la logique métier dans des services.
- Injecte les dépendances via le conteneur de services.
- Utilise les plugins pour les comportements extensibles.
- Sépare les responsabilités entre contrôleurs, services, repositories et entités.
- Évite les appels statiques à `\Drupal::service()` dans les classes injectables.

## Sécurité

- Valide et filtre toute entrée utilisateur.
- Utilise les APIs de rendu et d’échappement de Drupal.
- Vérifie les permissions et les accès avant toute opération sensible.
- Utilise des requêtes paramétrées ou l’API de base de données Drupal.
- Ne stocke jamais de secret dans le dépôt ou la configuration exportée.

## Tests

- Ajoute des tests unitaires pour la logique isolée.
- Ajoute des tests Kernel pour les services, entités et intégrations Drupal.
- Ajoute des tests Functional pour les parcours utilisateurs critiques.
- Documente les scénarios de vérification manuelle lorsque les tests
  automatisés ne suffisent pas.

## Livraison

Avant de terminer, vérifie :

- syntaxe et standards PHP (`lando php -l`, `lando phpcs`) ;
- analyse statique ;
- tests ;
- configuration exportée ;
- cache et rebuild nécessaires ;
- impacts sur les permissions, routes et données existantes.