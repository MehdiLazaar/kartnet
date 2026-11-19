/**
 * Palette de marque Kartnet, partagée entre les écrans.
 * Direction « Carte au trésor » : une carte de quête dépliée, fond parchemin, encre brune,
 * épingles rubis, or pour les trésors, bleu-vert de mer.
 * Les noms des clés n'ont pas changé : tous les écrans suivent sans modification.
 */
export const CouleursMarque = {
  // --- Couleurs de la charte ---
  cream: '#F6EEDC',      // parchemin : fond des écrans
  paper: '#FFFBF2',      // vélin : cartes, boîtes de dialogue, texte posé sur rubis
  ink: '#2E2418',        // encre brune : texte principal, cadres
  muted: '#6B5C47',      // sépia : dates, lieux, légendes (5,4:1 sur parchemin)
  ocean: '#1C6E6C',      // mer : liens, onglet actif (5,6:1 sur parchemin)
  onOcean: '#FFFBF2',    // texte et icônes posés sur la mer
  coral: '#C2453A',      // rubis : épingles, action principale (6:1 sur parchemin)
  coralDeep: '#9E3329',  // rubis foncé : erreurs, actions destructives
  sand: '#D9A21B',       // trésor : badges, détails dorés (jamais en texte)
  moss: '#5E7F33',       // mousse : lieux découverts
  line: '#D9CBAA',       // bordures légères, séparateurs
  cadre: '#2E2418',      // cadre de 2 px des boîtes de dialogue (cartes de voyage, boutons)

  // --- Teintes complémentaires propres à l'app ---
  avatar: '#EADFC6',
  photoPlaceholder: '#E3D7BD',
  captionTint: '#F1E4C8',
  mapTint: '#EADFC6',    // fond des icônes de voyage
  mapLand: '#E9E3CC',
  mapRoad: '#DCD2B8',
} as const;

/**
 * Familles de polices chargées au démarrage (src/app/_layout.tsx, expo-font).
 * Les fichiers sont dans assets/fonts, sous licence SIL OFL 1.1.
 */
export const Polices = {
  titre: 'Jersey10',     // titres et nom « Kartnet » : pixel étroit des boîtes de dialogue de RPG
  etiquette: 'Silkscreen', // petites étiquettes en capitales
} as const;

/**
 * Police des titres et du nom « Kartnet ». Un seul endroit à modifier pour changer tous les titres.
 * Pas de fontWeight : la police n'a qu'une graisse, et un gras forcé la ferait remplacer sur Android.
 */
export const PoliceTitre = { fontFamily: Polices.titre, letterSpacing: 0.3 } as const;

/** Police des petites étiquettes en capitales (surtitres, destinations, onglets). */
export const PoliceEtiquette = { fontFamily: Polices.etiquette, letterSpacing: 0.4 } as const;
