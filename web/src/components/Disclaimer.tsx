// ============================================================================
// ResiliaMap web — src/components/Disclaimer.tsx
// ----------------------------------------------------------------------------
// Mandatory caveat banner: Arcep coverage is simulated/indicative and NOT
// contractual; the resilience score is a derived indicator on open data, not an
// official Arcep product. Plus data attributions + AGPL notice.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
export default function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p className="disclaimer__main">
        <strong>Méthodologie —</strong> Le score repose sur des données{" "}
        <strong>factuelles</strong>, pas sur les cartes de couverture simulées : le{" "}
        <strong>registre ANFR</strong> des sites radio autorisés (&gt; 5 W) et les{" "}
        <strong>pannes déclarées par les opérateurs</strong>. Seule réserve : la
        présence d’une antenne 4G à proximité ne garantit pas la réception réelle
        (propagation, bâti, terminal) — le score mesure la robustesse de
        l’infrastructure, pas la qualité de service. Seuils <strong>étalonnés</strong>{" "}
        sur la métropole (rayon 3&nbsp;km, redondance opérateurs, instabilité
        normalisée par densité). ResiliaMap n’est pas un produit officiel de l’Arcep.
      </p>
      <p className="disclaimer__sources">
        Sources : Arcep « sites indisponibles », ANFR (installations &gt; 5 W),
        FINESS, services de police et unités de gendarmerie accueillant du public
        (Licence Ouverte). Code sous licence{" "}
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          target="_blank"
          rel="noreferrer"
        >
          AGPL-3.0
        </a>
        .
      </p>
    </footer>
  );
}
