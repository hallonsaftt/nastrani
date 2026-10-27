"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PersonCard as SearchHit } from "@/lib/data";

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searched, setSearched] = useState("");
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setSearched("");
      return;
    }
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = (await res.json()) as { results: SearchHit[] };
        if (id !== reqId.current) return; // stigao je noviji upit
        setResults(data.results);
        setSearched(term);
        setActive(data.results.length ? 0 : -1);
      } catch {
        /* mreža — ignoriši, sledeći taster pokušava ponovo */
      }
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  const open = focused && searched.length >= 2 && q.trim().length >= 2;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) router.push(`/osoba/${results[active].slug}`);
      else router.push(`/prijava?ime=${encodeURIComponent(q.trim())}`);
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <div className={`search${open ? " open" : ""}`}>
      <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="Ime i prezime…"
        aria-label="Pretraga po imenu"
        role="combobox"
        aria-expanded={open}
        aria-controls="suggest"
        aria-activedescendant={open && active >= 0 ? `sug-${active}` : undefined}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul className="suggest" id="suggest" role="listbox">
          {results.map((r, i) => (
            <li key={r.slug} id={`sug-${i}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)}>
              <Link href={`/osoba/${r.slug}`}>
                <span>
                  <span className="name">{r.name}</span>
                  <br />
                  <span className="meta">{[r.role, r.city].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="chips">
                  {r.parties.map((p) => (
                    <span key={p.short} className="chip">
                      <i style={{ background: p.color }} />
                      {p.short}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li>
              <div className="empty">
                <span>Nema objavljenog profila za „{searched}”.</span>
                <Link href={`/prijava?ime=${encodeURIComponent(searched)}`}>Podnesi zahtev za istraživanje →</Link>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
