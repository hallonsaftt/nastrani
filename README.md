# na strani .rs

Javna baza veza funkcionera i javnih ličnosti sa političkim strankama u Srbiji.

## Pokretanje

```bash
npm install
cp .env.example .env.local   # podesi ADMIN_USER / ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

Zahteva Node 22.13+ (koristi ugrađeni `node:sqlite`). Baza je `data/nastrani.db` i pravi se sama pri prvom pokretanju,
sa **izmišljenim** demo podacima (`lib/seed.ts`). Pre objavljivanja obriši `data/nastrani.db` i izmeni/isprazni seed.

## Stranice

- `/` — pretraga sa predlozima uživo (latinica, ćirilica, sa ili bez kvačica)
- `/osoba/[slug]` — profil: veze sa strankama (svaka sa izvorom), biografija, imovina, hronologija
- `/stranka`, `/stranka/[slug]` — stranke i povezana lica
- `/prijava` — zahtev za novo lice ili ispravku / pravo na odgovor
- `/admin` — pregled zahteva i promena statusa (Basic Auth)
- `/metodologija` — koga istražujemo, izvori, ispravke

## Model podataka (`lib/db.ts`)

`parties` · `persons` (status `draft`/`published` — javno se vide samo objavljeni) · `connections` (osoba ↔ stranka, tip, period, **obavezan izvor**) · `timeline` · `requests`.
