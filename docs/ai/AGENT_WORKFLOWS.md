# Workflows agents

## Demande de correction backend

Exemple :

> Analyse `project/web/modules/custom/my_module/src/Service/OrderService.php`,
> identifie les problèmes de sécurité et corrige-les.

1. Claude route vers `backend-reviewer`.
2. L’agent analyse le fichier, ses dépendances et ses tests.
3. Il produit un diagnostic.
4. Il applique les correctifs uniquement parce que la demande le demande.
5. `drupal-qa` vérifie les tests et l’analyse statique.

## Nouvelle fonctionnalité transverse

Exemple :

> Ajoute un filtre de recherche avancée sur la page catalogue.

1. `task-router` sépare le besoin.
2. `backend-developer` crée ou adapte le service, la route, les paramètres
   de requête et les tests.
3. `frontend-developer` implémente le formulaire, les templates et les styles.
4. `drupal-qa` vérifie l’ensemble.

## Revue sans modification

Exemple :

> Fais une revue de sécurité du module `my_module`, sans rien modifier.

1. Claude route vers `backend-reviewer`.
2. L’agent lit le code et produit un diagnostic.
3. Aucune modification n’est appliquée, car la demande ne contient pas
   d’instruction de correction.