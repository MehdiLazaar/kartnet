/**
 * Palette de marque Kartnet, partagée entre les écrans.
 * Valeurs reprises de la charte graphique (design system Kartnet, thème clair).
 */
export const CouleursMarque = {
  // --- Couleurs de la charte ---
  cream: '#FAF7F2',      // fond des écrans
  paper: '#FFFFFF',      // cartes, cadre polaroid des photos
  ink: '#1E2A33',        // texte principal
  muted: '#5E6870',      // ink-muted : dates, lieux, légendes (5,5:1 sur cream)
  ocean: '#1F5F8B',      // primaire : liens, navigation, onglet actif
  onOcean: '#FAF7F2',    // texte et icônes posés sur ocean
  coral: '#E8735A',      // épingles, action principale (une seule par écran)
  coralDeep: '#B8462F',  // corail lisible en texte (actions destructives, liens)
  sand: '#F2C14E',       // badges, statistiques
  line: '#C9CFD3',       // pebble : bordures, séparateurs

  // --- Teintes complémentaires propres à l'app (hors charte) ---
  avatar: '#E9DED0',
  photoPlaceholder: '#D9E2DE',
  captionTint: '#F8EEE6',
  mapTint: '#E6EFF5',
  mapLand: '#EAF1E9',
  mapRoad: '#DCE9E4',
} as const;

/**
 * Police des titres et du nom « Kartnet » : la police système en gras serré,
 * celle de l'en-tête des écrans. Un seul endroit à modifier pour changer tous les titres.
 */
export const PoliceTitre = { fontWeight: '800', letterSpacing: -0.6 } as const;
