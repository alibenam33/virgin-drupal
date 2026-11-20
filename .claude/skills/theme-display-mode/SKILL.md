---
name: theme-display-mode
description: Met en place le theming d'un display mode (view mode) pour un type de contenu précis — sélection interactive du type de contenu puis du display mode, activation du display si besoin (backend), puis template Twig, CSS et librairie dans le thème virgin (frontoffice), et vérification QA. À utiliser quand l'utilisateur veut thémer/styler l'affichage « teaser », « full », « card »… d'un type de contenu.
---

# Theming d'un display mode pour un type de contenu

Ce skill s'exécute dans la session principale (orchestrateur). Il collecte les
choix de l'utilisateur, puis délègue : la session principale ne modifie jamais
elle-même les fichiers du thème ni la configuration.

Rappels projet :
- Projet Drupal dans `project/`, config exportée dans `project/config/sync`.
- Thème front : `project/web/themes/custom/virgin` (sous-thème d'Olivero).
- Pas de PHP sur l'hôte : toute commande Drupal passe par Lando, depuis `project/`.

## Étape 1 — Inventaire (lecture seule)

Construis la liste des choix possibles à partir de la config exportée **et** de
la base (la base peut contenir des éléments non exportés) :

```bash
cd project
ls config/sync | sed -n 's/^node\.type\.\(.*\)\.yml$/\1/p'
ls config/sync | sed -n 's/^core\.entity_view_mode\.node\.\(.*\)\.yml$/\1/p'
ls config/sync | sed -n 's/^core\.entity_view_display\.node\.\(.*\)\.yml$/\1/p'
lando drush php:eval 'foreach (\Drupal::entityTypeManager()->getStorage("node_type")->loadMultiple() as $t) { echo $t->id(), "|", $t->label(), PHP_EOL; }'
lando drush php:eval 'foreach (\Drupal::service("entity_display.repository")->getViewModes("node") as $id => $m) { echo $id, "|", $m["label"], PHP_EOL; }'
```

Si `lando` n'est pas disponible, utilise uniquement `config/sync` et signale-le.
Si un élément n'existe qu'en base (pas dans `config/sync`), signale-le à
l'utilisateur : il faudra l'exporter.

## Étape 2 — Sélection interactive du type de contenu

Utilise l'outil **AskUserQuestion** (une seule question, `multiSelect: false`) :

- `header` : `Contenu`
- `question` : « Pour quel type de contenu veux-tu mettre en place le theming d'un display mode ? »
- une option par type de contenu : `label` = libellé humain, `description` =
  nom machine (+ nombre de nœuds existants si connu).
- AskUserQuestion accepte 2 à 4 options. S'il y a plus de 4 types, propose les
  4 plus pertinents (ceux ayant du contenu ou mentionnés dans la conversation) ;
  l'utilisateur peut saisir un autre nom machine via « Other ». Valide toute
  saisie libre contre l'inventaire, et redemande si elle ne correspond à rien.

Si l'utilisateur a déjà nommé sans ambiguïté le type de contenu dans sa
demande, confirme-le simplement dans la question suivante plutôt que de reposer
la question.

## Étape 3 — Sélection interactive du display mode

Seconde question **AskUserQuestion**, posée après la réponse précédente (les
options dépendent du type choisi) :

- `header` : `Display`
- `question` : « Quel display mode du type <libellé> (<machine>) veux-tu thémer ? »
- une option par view mode node. Dans `description`, indique pour ce type :
  « display personnalisé actif » si `core.entity_view_display.node.<type>.<mode>`
  existe et est `status: true`, sinon « utilise actuellement le display par
  défaut — sera activé ». Mets en premier les displays déjà personnalisés et
  `teaser` / `full`. Ignore `rss`, `search_index` et `search_result` sauf s'il
  reste de la place ou si l'utilisateur les demande.
- Limite de 4 options : même règle qu'à l'étape 2 (saisie libre via « Other »,
  validée contre l'inventaire). Si le display mode voulu n'existe pas du tout,
  propose de le créer (étape 4).

Récapitule ensuite le choix en une ligne : `node.<type>.<mode>`.

## Étape 4 — Préparation backend (si nécessaire)

Analyse sans modifier :
- le display `core.entity_view_display.node.<type>.<mode>` existe-t-il et est-il
  activé ? Quels champs sont affichés, avec quels formatters / view modes de
  média ?
- un template existe-t-il déjà (`templates/**/node--<type>--<mode>.html.twig`,
  avec les tirets) ?
- `lando drush config:status` : des écarts non exportés touchent-ils ce display ?

Si le view mode n'existe pas, ou si le display n'est pas activé pour ce type,
ou si les champs affichés doivent changer : délègue à **`backend-developer`**
(création du view mode, activation du display personnalisé, configuration des
champs/formatters, puis export **ciblé** des fichiers concernés dans
`config/sync`, sans exporter d'autres écarts non liés). Demande-lui de lister
les fichiers de config modifiés.

En cas de doute sur les champs à afficher (ex. image, résumé, date,
catégories pour un teaser), demande à l'utilisateur avant de déléguer.

## Étape 5 — Theming (frontoffice)

Délègue à **`frontend-developer`** avec un brief contenant le type, le display
mode, la liste des champs rendus (et leurs formatters) et les conventions du
thème virgin :

- Template : `project/web/themes/custom/virgin/templates/node/node--<type-avec-tirets>--<mode-avec-tirets>.html.twig`,
  bâti à partir du `node.html.twig` d'Olivero (`project/web/core/themes/olivero/templates/content/node.html.twig`,
  à lire, jamais à modifier). Docblock en tête décrivant le rôle et les champs.
- Classes BEM : `node`, `node--type-<type>`, `node--view-mode-<mode>`, plus un
  bloc composant dédié (ex. `news-teaser`, `news-teaser__title`…), via
  `|clean_class`.
- Rendu des champs via `content.field_xxx` (respecte le display configuré) ;
  `{{ content|without(...) }}` pour le reste. Pas de logique métier en Twig :
  si un traitement est nécessaire, le signaler (preprocess dans `virgin.theme`
  limité à la présentation, sinon backend).
- Accessibilité : niveau de titre cohérent avec le contexte (h2/h3 en liste,
  h1 géré par la page en `full`), lien unique et explicite vers le nœud en
  teaser, images décoratives ou alt pertinent, focus visible.
- CSS : `css/node/<type>-<mode>.css` (mobile first, variables/tokens de
  `css/base.css` si présentes), déclarée dans une librairie dédiée de
  `virgin.libraries.yml` (`node.<type>.<mode>`, catégorie `component`), attachée
  depuis le template avec `attach_library('virgin/node.<type>.<mode>')`.
- JS seulement si nécessaire (Drupal behaviors + `once`, dépendances
  `core/drupal`, `core/once`).
- Puis `lando drush cache:rebuild`.

## Étape 6 — Vérification

Délègue à **`drupal-qa`** :
- syntaxe Twig/YAML, `lando phpcs` sur `virgin.theme` si modifié ;
- `lando drush config:status` : seuls les écarts attendus ;
- rendu HTTP 200 d'une page affichant ce display (nœud en `full`, ou une liste
  / vue utilisant le `teaser`) et présence des classes `node--view-mode-<mode>`
  et de la feuille CSS dans le HTML ; si le debug Twig est activé, vérifier que
  le template retenu est bien `node--<type>--<mode>.html.twig` ;
- absence de nouvelle erreur dans le watchdog (`--severity-min=3`).

Ne commite rien sans demande explicite.

## Fin de tâche

Termine par le bloc `### Résultat` du projet (ce qui a été fait, fichiers,
vérifications, points restants / risques), en mentionnant explicitement :
le display traité (`node.<type>.<mode>`), les fichiers de config exportés, le
template et la librairie créés, et la page à consulter pour voir le rendu.
