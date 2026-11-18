# Frontières frontoffice

- Les thèmes vivent dans `project/web/themes`.
- Les templates Twig sont responsables du rendu, pas de la logique métier.
- Les styles et scripts sont chargés via les librairies Drupal.
- Les composants front ne doivent pas dépendre directement de structures
  internes du backend.
- Toute donnée manquante doit être demandée au backend via l’orchestrateur.