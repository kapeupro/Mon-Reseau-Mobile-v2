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
        <strong>Avertissement —</strong> Le score de résilience est un indicateur{" "}
        <em>dérivé</em> calculé à partir de données ouvertes (Arcep, ANFR,
        data.gouv.fr). Les cartes de couverture Arcep sont{" "}
        <strong>simulées, indicatives et non contractuelles</strong> (le terrain,
        le bâti, le terminal et la météo influent sur la réception réelle).
        ResiliaMap n’est pas un produit officiel de l’Arcep.
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
