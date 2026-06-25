// ============================================================================
// ResiliaMap web — src/components/SearchBar.tsx
// ----------------------------------------------------------------------------
// F3d ADDRESS / COMMUNE SEARCH. Debounced autocomplete against the French BAN
// geocoder (Base Adresse Nationale) — called DIRECTLY from the browser, no key:
//   https://api-adresse.data.gouv.fr/search/?q=...&limit=5
// On select, the parent flies the map to the result (lon/lat in EPSG:4326,
// exactly what MapLibre expects). This component owns only its input + the
// transient result list; the map move is delegated via onSelect.
//
// SRID note: BAN returns geometry in WGS84 (lon,lat); no projection needed.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { useEffect, useId, useRef, useState } from "react";

/** A single BAN feature reduced to what we render / fly to. */
interface BanResult {
  id: string;
  label: string;
  lon: number;
  lat: number;
}

interface Props {
  /** Called when the user picks a result. lon/lat are EPSG:4326. */
  onSelect: (lon: number, lat: number, label: string) => void;
  /** Debounce window for the geocoder call (ms). */
  debounceMs?: number;
}

const BAN_URL = "https://api-adresse.data.gouv.fr/search/";

/** Shape of one BAN GeoJSON feature we read (loosely typed; external API). */
interface BanFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: { id?: string; label?: string };
}

export default function SearchBar({ onSelect, debounceMs = 300 }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BanResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);

  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Debounced geocoder query. Aborts the in-flight request on each keystroke.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${BAN_URL}?q=${encodeURIComponent(term)}&limit=5`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`BAN ${res.status}`);
        const json = (await res.json()) as { features?: BanFeature[] };
        const next: BanResult[] = (json.features ?? [])
          .map((f, i): BanResult | null => {
            const c = f.geometry?.coordinates;
            const label = f.properties?.label;
            if (!c || typeof label !== "string") return null;
            return {
              id: f.properties?.id ?? `${label}-${i}`,
              label,
              lon: c[0],
              lat: c[1],
            };
          })
          .filter((r): r is BanResult => r !== null);
        setResults(next);
        setOpen(true);
        setActive(-1);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [q, debounceMs]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(r: BanResult) {
    onSelect(r.lon, r.lat, r.label);
    setQ(r.label);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (active >= 0 && active < results.length) {
        e.preventDefault();
        pick(results[active]!);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="search" ref={rootRef}>
      <input
        type="search"
        className="search__input"
        placeholder="Rechercher une adresse ou commune…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          active >= 0 ? `${listId}-opt-${active}` : undefined
        }
        autoComplete="off"
      />
      {loading && <span className="search__spinner" aria-hidden="true" />}
      {open && results.length > 0 && (
        <ul className="search__results" id={listId} role="listbox">
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`search__item${i === active ? " search__item--active" : ""}`}
              onMouseDown={(e) => {
                // mousedown (not click) so it fires before the input blur.
                e.preventDefault();
                pick(r);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
