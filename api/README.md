# API Kartnet

API REST de Kartnet : comptes, voyages, étapes (villes) et souvenirs géolocalisés.
Elle sert de **sauvegarde et de synchronisation** à l'app mobile, qui fonctionne d'abord hors ligne
(voir le document d'architecture du projet).

**Stack** : Node.js 24 · Express 5 · TypeScript · PostgreSQL 17 · Prisma 7 · Zod · JWT · Multer · Vitest

---

## Démarrer en 5 minutes

Prérequis : Node.js 24 et Docker Desktop lancé.

```bash
cd api
npm install                 # installe les dépendances et génère le client Prisma
cp .env.example .env        # puis remplace JWT_SECRET par un vrai secret (voir le commentaire dans le fichier)
npm run db:up               # lance PostgreSQL dans Docker
npm run db:deploy           # crée les tables
npm run db:seed             # ajoute le compte démo et un voyage au Portugal
npm run dev                 # démarre l'API sur http://localhost:3000/api/v1
```

Vérifier : ouvrir http://localhost:3000/api/v1/health → `{"status":"ok","database":"ok"}`.

**Compte démo** : `demo@kartnet.app` / `kartnet123`

## Toutes les commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | API en mode développement (redémarre à chaque modification) |
| `npm test` | Lance les tests automatiques (base `kartnet_test` séparée) |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run build` puis `npm start` | Compile puis lance la version de production |
| `npm run db:up` / `db:down` | Démarre / arrête PostgreSQL (Docker) |
| `npm run db:migrate` | Après une modification de `prisma/schema.prisma` : crée et applique une migration |
| `npm run db:deploy` | Applique les migrations existantes (après un `git pull`) |
| `npm run db:seed` | Recrée les données de démo |
| `npm run db:reset` | ⚠️ Vide toute la base et réapplique les migrations |
| `npm run db:studio` | Interface web pour voir et modifier les données |

## Organisation du code

Chaque requête traverse les couches dans cet ordre. Chaque couche ne connaît que celle du dessous.

```
requête HTTP
  → middlewares/   sécurité, authentification JWT, réception de la photo, limite de tentatives
  → routes/        quelle URL appelle quel contrôleur
  → controllers/   valide les données (schemas/) puis appelle le service, et répond
  → services/      la logique métier : droits d'accès, règles de synchronisation
  → lib/prisma     accès à PostgreSQL          storage/   enregistrement des photos
```

```
api/
├─ prisma/
│  ├─ schema.prisma        les 4 tables : User, Trip, Step, Memory
│  ├─ migrations/          historique des changements de la base (commité)
│  └─ seed.ts              données de démo
├─ src/
│  ├─ index.ts             démarre le serveur (et l'arrête proprement)
│  ├─ app.ts               assemble l'application Express
│  ├─ config/env.ts        lit et valide le .env : l'API refuse de démarrer s'il est incomplet
│  ├─ routes/index.ts      la liste de toutes les routes
│  ├─ controllers/         un fichier par ressource
│  ├─ services/            un fichier par ressource + sync-rules.ts (résolution des conflits)
│  ├─ middlewares/         auth, upload, rate-limit, error-handler
│  ├─ schemas/             validation Zod des données reçues
│  ├─ storage/             stockage des photos (interface + version locale)
│  ├─ lib/                 prisma, jwt, logger, AppError
│  ├─ types/               complément de types pour Express (req.user)
│  └─ generated/           client Prisma généré (non commité)
├─ tests/                  tests automatiques (Vitest + Supertest)
├─ requests.http           requêtes prêtes à l'emploi pour tester à la main
└─ Dockerfile
```

Le fichier `docker-compose.yml` est à la racine du dépôt, et la CI dans `.github/workflows/api.yml`.

## Les routes

Préfixe : `/api/v1`. Toutes les routes, sauf `health`, `auth/register` et `auth/login`, exigent
l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Rôle | Réponse |
| --- | --- | --- | --- |
| GET | `/health` | L'API et la base répondent-elles ? | 200 ou 503 |
| POST | `/auth/register` | Créer un compte `{ email, password }` | 201 `{ token, user }` |
| POST | `/auth/login` | Se connecter `{ email, password }` | 200 `{ token, user }` |
| GET | `/auth/me` | L'utilisateur connecté | 200 |
| GET | `/trips` | Mes voyages, avec `stepCount` et `memoryCount` | 200 |
| GET | `/trips/:id` | Le voyage complet pour le retracer : `steps` (avec leurs `memories`), `unassignedMemories`, `path` | 200 |
| PUT | `/trips/:id` | Créer ou modifier un voyage | 201 (créé) ou 200 |
| DELETE | `/trips/:id` | Supprimer un voyage, ses étapes et ses souvenirs | 204 |
| PUT | `/steps/:id` | Créer ou modifier une étape et sa note | 201 ou 200 |
| DELETE | `/steps/:id` | Supprimer une étape (ses souvenirs sont gardés, détachés) | 204 |
| POST | `/memories` | Créer ou modifier un souvenir, en **multipart** avec le champ `photo` | 201 ou 200 |
| DELETE | `/memories/:id` | Supprimer un souvenir | 204 |
| GET | `/sync?since=<date ISO>` | Tout ce qui a changé depuis `since`, suppressions comprises | 200 |

### Exemples de corps

```jsonc
// PUT /trips/:id
{ "name": "Road trip au Portugal", "startDate": "2026-07-01", "endDate": "2026-07-12",
  "coverUrl": null, "updatedAt": "2026-07-01T08:00:00.000Z" }

// PUT /steps/:id
{ "tripId": "<uuid>", "city": "Lisbonne", "country": "Portugal", "note": "…", "order": 0,
  "updatedAt": "2026-07-01T08:00:00.000Z" }
```

`POST /memories` (multipart/form-data) : `id`, `tripId`, `stepId` (facultatif), `latitude`, `longitude`,
`takenAt`, `note` (facultatif), `updatedAt`, et le fichier `photo` (JPEG, PNG, WebP ou HEIC, 10 Mo max).
La photo est obligatoire pour créer un souvenir, facultative pour le modifier.

### Format des erreurs

Toujours le même, pour que l'app n'ait qu'une seule façon de les afficher :

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Certaines données sont invalides",
             "details": [{ "field": "endDate", "message": "La date de fin doit être après la date de début" }] } }
```

Codes possibles : `VALIDATION_ERROR`, `BAD_REQUEST`, `UNAUTHORIZED`, `INVALID_CREDENTIALS`, `NOT_FOUND`,
`ROUTE_NOT_FOUND`, `CONFLICT`, `FILE_TOO_LARGE`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`.

## Les règles de synchronisation

C'est ce qui permet à l'app de fonctionner hors ligne sans perdre ni dupliquer de données.

1. **L'id est créé par le téléphone** (UUID). Un souvenir pris dans l'avion a déjà son id définitif.
   Renvoyer deux fois la même requête ne crée donc jamais de doublon.
2. **Créer et modifier, c'est la même requête** (`PUT /trips/:id`, `PUT /steps/:id`, `POST /memories`).
   Le téléphone n'a pas besoin de savoir si le serveur connaît déjà la donnée.
3. **La dernière modification gagne.** Chaque envoi porte `updatedAt` (heure de la modification sur le téléphone).
   Si le serveur a une version plus récente, il l'ignore et renvoie la sienne. Voir `src/services/sync-rules.ts`.
4. **Les suppressions sont « douces »** : `deletedAt` est rempli au lieu d'effacer la ligne, pour que
   `GET /sync` puisse prévenir les autres appareils. Une donnée supprimée ne peut plus être modifiée.
5. **Deux dates différentes** : `updatedAt` (heure du téléphone, pour les conflits) et `serverUpdatedAt`
   (heure d'enregistrement sur le serveur, pour `GET /sync`). Un souvenir pris hors ligne hier et envoyé
   aujourd'hui est ainsi bien vu par un appareil synchronisé ce matin.

Côté app : garder le `serverTime` renvoyé par `GET /sync` et le passer en `since` la fois suivante.

## Brancher l'app mobile

Sur un téléphone, `localhost` désigne **le téléphone lui-même**, pas ton PC. Il faut utiliser l'adresse IP
du PC sur le Wi-Fi (Windows : `ipconfig`, ligne « Adresse IPv4 », par exemple `192.168.1.20`).

- Dans `api/.env` : `PUBLIC_URL=http://192.168.1.20:3000` (pour que les URL des photos fonctionnent).
- Dans l'app Expo : une variable `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api/v1`.
- Le PC et le téléphone doivent être sur le même Wi-Fi. Si Windows le demande, autorise Node.js dans le pare-feu.

## Sécurité en place

- Mots de passe hachés avec bcrypt, jamais renvoyés ni journalisés.
- Token JWT signé, expiration configurable (`JWT_EXPIRES_IN`).
- Même message d'erreur et même durée de réponse pour « email inconnu » et « mauvais mot de passe ».
- 20 tentatives de connexion max par quart d'heure et par adresse IP.
- Chaque requête vérifie que la donnée appartient bien à l'utilisateur (sinon 404).
- Toutes les données reçues sont validées (Zod). Photos : type et taille contrôlés, nom de fichier aléatoire.
- En-têtes HTTP de sécurité (helmet). Aucun secret dans le code : tout est dans `.env`.

## Faire évoluer

- **Ajouter un champ** : modifier `prisma/schema.prisma` → `npm run db:migrate -- --name ajout-du-champ`
  → mettre à jour le schéma Zod et le service concernés → ajouter un test.
- **Passer les photos sur Cloudinary** : créer `src/storage/cloudinary-storage.ts` qui implémente
  `StorageService`, ajouter `cloudinary` dans `STORAGE_DRIVER` (`src/config/env.ts`) et dans `src/storage/index.ts`.
  Rien d'autre ne change.
- **Changer la forme d'une route** : la créer sous `/api/v2` pour ne pas casser les anciennes versions de l'app.

## Déployer (Render, Railway…)

1. Créer une base PostgreSQL chez l'hébergeur et récupérer son URL.
2. Créer un service web à partir du dossier `api/` (le `Dockerfile` suffit).
3. Variables d'environnement : `DATABASE_URL`, `JWT_SECRET`, `PUBLIC_URL` (l'adresse publique du service),
   `NODE_ENV=production`.
4. Au démarrage, le conteneur applique les migrations puis lance l'API.

⚠️ Avec le stockage local, les photos sont perdues à chaque redéploiement sur la plupart des hébergeurs
gratuits. Pour une mise en ligne durable, passez à Cloudinary (voir plus haut).
