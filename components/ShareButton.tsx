"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* korisnik je odustao — padamo na kopiranje */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard nije dostupan */
    }
  }

  return (
    <button type="button" className="btn-ghost" onClick={share}>
      {copied ? "Link kopiran ✓" : "Podeli"}
    </button>
  );
}
