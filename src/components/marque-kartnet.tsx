import Svg, { Circle, Path } from 'react-native-svg';

import { CouleursMarque as C } from '@/constants/identite-visuelle';

// Éléments graphiques de la charte Kartnet, redessinés en SVG à partir des fichiers du design system.

/** Symbole du logo (piste A « épingle-objectif ») : une épingle de carte dont la tête est un objectif. */
export function SymboleKartnet({ taille = 40 }: Readonly<{ taille?: number }>) {
  // Le symbole est plus haut que large (ratio de l'épingle d'origine : 80 × 126).
  return (
    <Svg width={(taille * 80) / 126} height={taille} viewBox="20 18 80 126" accessibilityElementsHidden>
      <Path d="M60 142C39 113.5 22 80.8 22 58A38 38 0 1 1 98 58C98 80.8 81 113.5 60 142Z" fill={C.coral} />
      <Circle cx={60} cy={58} r={22} fill={C.ink} />
      <Circle cx={60} cy={58} r={12} fill={C.ocean} />
      <Circle cx={55} cy={53} r={4.5} fill={C.cream} />
    </Svg>
  );
}

/**
 * Motif de la charte : un trajet en pointillés qui relie des épingles.
 * Décoratif uniquement (jamais derrière du texte) : il s'étire sur toute la largeur.
 */
export function MotifParcours() {
  // aspectRatio garde les proportions du dessin : les épingles restent rondes quelle que soit la largeur.
  return (
    <Svg style={{ width: '100%', aspectRatio: 800 / 120 }} viewBox="0 0 800 120" accessibilityElementsHidden>
      <Path
        d="M20 96C120 40 180 100 270 70S400 20 480 52 610 104 680 60 740 24 780 22"
        stroke={C.ocean}
        strokeWidth={3}
        strokeDasharray="12 10"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={20} cy={96} r={9} fill={C.coral} />
      <Circle cx={270} cy={70} r={9} fill={C.coral} />
      <Circle cx={480} cy={52} r={9} fill={C.coral} />
      <Circle cx={780} cy={22} r={13} fill={C.coral} />
      <Circle cx={780} cy={22} r={4.5} fill={C.cream} />
    </Svg>
  );
}
