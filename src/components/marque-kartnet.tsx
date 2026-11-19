import Svg, { Rect } from 'react-native-svg';

import { CouleursMarque as C } from '@/constants/identite-visuelle';

// Éléments graphiques de la charte « Carte au trésor », dessinés en pixel art avec react-native-svg.
// Chaque dessin est une grille : une lettre = un pixel d'une couleur, un point = un pixel vide.

/** L'épingle-objectif sur une grille de 12 × 16 : P épingle, R bague, L lentille, G reflet. */
const EPINGLE = [
  '....PPPP....',
  '..PPPPPPPP..',
  '.PPPRRRRPPP.',
  '.PPRRLLRRPP.',
  'PPRRLGLLRRPP',
  'PPRRLLLLRRPP',
  'PPRRLLLLRRPP',
  '.PPRRLLRRPP.',
  '.PPPRRRRPPP.',
  '..PPPPPPPP..',
  '..PPPPPPPP..',
  '...PPPPPP...',
  '....PPPP....',
  '....PPPP....',
  '.....PP.....',
  '.....PP.....',
];

/** Transforme une grille de lettres en carrés SVG colorés. */
function Pixels({ grille, couleurs }: Readonly<{ grille: string[]; couleurs: Record<string, string> }>) {
  return grille.flatMap((ligne, y) =>
    [...ligne].map((lettre, x) =>
      couleurs[lettre] ? (
        // 1.02 au lieu de 1 : évite les fines lignes vides entre deux pixels voisins.
        <Rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={couleurs[lettre]} />
      ) : null,
    ),
  );
}

/** Symbole du logo : l'épingle-objectif en pixel art. `taille` = hauteur en points. */
export function SymboleKartnet({ taille = 40 }: Readonly<{ taille?: number }>) {
  return (
    <Svg width={(taille * 12) / 16} height={taille} viewBox="0 0 12 16" accessibilityElementsHidden>
      <Pixels grille={EPINGLE} couleurs={{ P: C.coral, R: C.ink, L: C.ocean, G: C.paper }} />
    </Svg>
  );
}

/**
 * Motif de la charte : un trajet en escalier de pixels qui relie trois épingles.
 * Décoratif uniquement (jamais derrière du texte) : il s'étire sur toute la largeur.
 */
export function MotifParcours() {
  const pas = [[2, 9], [6, 9], [10, 8], [14, 7], [18, 7], [22, 8], [26, 6], [30, 5], [34, 5], [38, 4], [42, 3], [46, 3], [50, 2], [54, 2], [58, 1]];
  const epingles = [[0, 8], [24, 5], [60, 0]];
  // aspectRatio garde les proportions : les pixels restent carrés quelle que soit la largeur.
  return (
    <Svg style={{ width: '100%', aspectRatio: 64 / 11 }} viewBox="0 0 64 11" accessibilityElementsHidden>
      {pas.map(([x, y]) => <Rect key={`t${x}`} x={x} y={y} width={2} height={1} fill={C.ink} />)}
      {epingles.map(([x, y]) => <Rect key={`e${x}`} x={x} y={y} width={3} height={3} fill={C.coral} />)}
    </Svg>
  );
}
