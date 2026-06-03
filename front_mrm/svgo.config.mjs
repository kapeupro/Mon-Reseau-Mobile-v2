export default {
  multipass: true, // plusieurs passes pour maximiser la compression
  js2svg: {
    pretty: false, // pas d'indentation = moins de caractères
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Réduire la précision des coordonnées (1 décimale au lieu de 3)
          cleanupNumericValues: {
            floatPrecision: 1,
          },
          convertPathData: {
            floatPrecision: 1,
            makeArcs: {
              threshold: 2.5,
              tolerance: 0.5,
            },
          },
          // Réduire la précision des transformations
          convertTransform: {
            floatPrecision: 1,
          },
        },
      },
    },
    // Fusionner les chemins identiques
    'mergePaths',
    // Supprimer les attributs inutiles
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name', 'data-*', 'xml:space'],
      },
    },
    // Supprimer les commentaires
    'removeComments',
    // Supprimer les métadonnées
    'removeMetadata',
    // Supprimer les éléments vides
    'removeEmptyContainers',
    // Supprimer les groupes inutiles
    'collapseGroups',
  ],
};