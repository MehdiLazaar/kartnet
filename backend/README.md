# Kartnet — backend Firebase

Kartnet n'a pas de serveur à nous : l'app parle directement à **Firebase**.

- **Firebase Authentication** gère les comptes (e-mail + mot de passe).
- **Cloud Firestore** stocke les voyages, les étapes et les souvenirs.
- **Les règles de sécurité** (`firestore.rules`) sont le vrai backend : elles décident qui peut lire et écrire quoi, et vérifient la forme des données. Tout ce qui n'est pas autorisé est refusé.

Les photos restent **sur le téléphone** (forfait gratuit Spark). Firestore ne garde que leur chemin. Le champ `photoStoragePath` est prévu pour passer plus tard à Cloud Storage, qui demande le forfait Blaze.

## Contenu du dossier

| Fichier | Rôle |
| --- | --- |
| `firestore.rules` | Règles de sécurité et de validation |
| `firestore.indexes.json` | Index composites nécessaires aux requêtes |
| `firebase.json` | Configuration du Firebase CLI et des emulators |
| `tests/firestore.rules.test.ts` | Tests des règles (21 cas) |
| `.firebaserc` | Lien vers le vrai projet Firebase (créé par `firebase use --add`) |

## Commandes

À lancer **depuis le dossier `backend/`**. Installation la première fois : `npm install`. Les emulators demandent Java (JDK 21 ou plus).

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm test` | Démarre un Firestore local, lance les tests des règles, puis l'arrête |
| `npm run emulators` | Démarre Firestore et Auth en local, avec une interface sur http://localhost:4000 |
| `npm run deploy` | Envoie les règles et les index sur le vrai projet Firebase |

Les tests et les emulators utilisent le projet fictif `demo-kartnet` : ils ne touchent jamais la vraie base.

**Toujours lancer `npm test` avant `npm run deploy`.** Une règle cassée peut bloquer toute l'app, ou pire, tout ouvrir.

## Modèle de données

Tout est rangé sous l'utilisateur. Grâce à ça, une seule condition (`request.auth.uid == uid`) protège toutes ses données.

```
users/{uid}
  └─ trips/{tripId}
       ├─ steps/{stepId}        une ville visitée, avec sa note
       └─ memories/{memoryId}   une photo géolocalisée, avec sa note
```

`?` = facultatif (peut être absent ou `null`). Tous les documents ont `createdAt` et `updatedAt`.

### `users/{uid}`

| Champ | Type | Règle |
| --- | --- | --- |
| `displayName` | string | 1 à 50 caractères |

### `users/{uid}/trips/{tripId}`

| Champ | Type | Règle |
| --- | --- | --- |
| `title` | string | 1 à 80 caractères |
| `description?` | string | 2000 caractères max |
| `startDate` | timestamp | |
| `endDate?` | timestamp | après `startDate` ; `null` = voyage en cours |
| `coverMemoryId?` | string | id du souvenir utilisé comme couverture |

### `users/{uid}/trips/{tripId}/steps/{stepId}`

| Champ | Type | Règle |
| --- | --- | --- |
| `city` | string | 1 à 100 caractères |
| `country?` | string | 100 caractères max |
| `note?` | string | 5000 caractères max |
| `location?` | GeoPoint | centre de la ville |
| `order` | entier | ≥ 0, position dans le voyage |
| `arrivedAt?` | timestamp | |

### `users/{uid}/trips/{tripId}/memories/{memoryId}`

| Champ | Type | Règle |
| --- | --- | --- |
| `localPhotoPath` | string | chemin **relatif** de la photo dans le dossier de l'app, ex. `memories/abc.jpg` |
| `takenAt` | timestamp | moment de la prise de vue |
| `location?` | GeoPoint | position GPS au moment de la photo |
| `placeName?` | string | nom du lieu (géocodage inverse), 200 caractères max |
| `stepId?` | string | id d'une étape **existante** du même voyage |
| `note?` | string | 5000 caractères max |
| `photoStoragePath?` | string | réservé à Cloud Storage, `null` pour l'instant |

## Ce que l'app doit respecter

Si un de ces points n'est pas respecté, Firestore refuse l'écriture avec `permission-denied`.

1. **`createdAt` et `updatedAt` = `serverTimestamp()`.** À la création, les deux. À la modification, seulement `updatedAt`, sans toucher `createdAt`. L'heure vient du serveur, pas du téléphone.
2. **Aucun champ en plus** de ceux listés ci-dessus. Pour en ajouter un, on modifie d'abord les règles et les tests.
3. **Une position = un `GeoPoint`** (`new GeoPoint(latitude, longitude)`), jamais une chaîne ou deux nombres séparés.
4. **Le voyage doit exister** avant ses étapes et souvenirs. On peut aussi créer le voyage et sa première étape dans le même `writeBatch`.
5. **Stocker un chemin relatif pour la photo**, pas l'URI complète. Sur iPhone, le chemin absolu du dossier de l'app change après une réinstallation ou une mise à jour. On reconstruit l'URI au moment de l'affichage.
6. **Supprimer un voyage ne supprime pas ses étapes et souvenirs.** Firestore ne fait pas de suppression en cascade. Le repository doit supprimer les étapes, les souvenirs puis le voyage, dans un `writeBatch`, sans oublier les fichiers photo sur le téléphone.

## Requêtes prévues

| Besoin dans l'app | Requête | Index |
| --- | --- | --- |
| Liste des voyages | `trips` triés par `startDate` décroissant | automatique |
| Étapes d'un voyage | `steps` triées par `order` | automatique |
| Retracer le voyage sur la carte | `memories` triés par `takenAt` | automatique |
| Souvenirs d'une étape | `memories` où `stepId ==` X, triés par `takenAt` | composite, dans `firestore.indexes.json` |

Une nouvelle requête qui combine un filtre et un tri sur deux champs différents demandera un index. Firestore renvoie alors une erreur avec un lien pour le créer. Ajoutez-le ensuite dans `firestore.indexes.json` pour le garder dans le dépôt.

## Faire évoluer le backend

- **Ajouter un champ** : `firestore.rules` (`hasOnly` + validation), puis un test, `npm test` et `npm run deploy`.
- **Envoyer les photos dans le cloud** : passer au forfait Blaze, activer Cloud Storage, ajouter un `storage.rules` sur le même modèle (`users/{uid}/...`) et remplir `photoStoragePath`.
- **Partager un voyage** : ajouter un champ `sharedWith` et une règle de lecture ; le reste du modèle ne change pas.
