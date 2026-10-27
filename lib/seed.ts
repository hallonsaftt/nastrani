import type { DatabaseSync } from "node:sqlite";
import { normalize } from "./normalize";

// IZMIŠLJENI demo podaci — samo da se vidi kako sajt izgleda.
// Sve osobe i stranke ovde su fiktivne (is_demo = 1) i sajt ih tako i označava.
// Pre objavljivanja obrisati bazu (data/nastrani.db) i uneti prave, proverene podatke.

const PARTIES = [
  { slug: "npp", name: "Narodni pokret Primer", short: "NPP", color: "#c0392b" },
  { slug: "glu", name: "Građanska lista Uzorak", short: "GLU", color: "#2471a3" },
  { slug: "dst", name: "Demokratski savez Test", short: "DST", color: "#d68910" },
];

type SeedPerson = {
  slug: string;
  name: string;
  aliases: string[];
  role: string;
  city: string;
  born: string;
  summary: string;
  biography: string;
  net_worth: string;
  net_worth_source: string;
  connections: {
    party: string;
    type: string;
    description: string;
    from: string;
    to: string | null;
    source_label: string;
  }[];
  timeline: [string, string][];
};

const PERSONS: SeedPerson[] = [
  {
    slug: "jovan-primerovic",
    name: "Jovan Primerović",
    aliases: ["Јован Примеровић"],
    role: "Direktor JP „Vodovod Primer”",
    city: "Kragujevac",
    born: "1974",
    summary:
      "Direktor javnog preduzeća od 2019. Pre imenovanja bio je odbornik i član gradskog odbora NPP.",
    biography:
      "Diplomirao na Ekonomskom fakultetu u Kragujevcu 1998. Do 2012. radio u privatnom sektoru kao komercijalista.\n\nOd 2012. aktivan u NPP, gde je bio član gradskog odbora i odbornik u skupštini grada (2016–2019). Vlada ga je 2019. imenovala za v.d. direktora JP „Vodovod Primer”, a 2021. za direktora po okončanju konkursa.",
    net_worth: "oko 310.000 EUR (stan, vikendica, vozilo)",
    net_worth_source: "Imovinska karta, Agencija za sprečavanje korupcije (primer)",
    connections: [
      { party: "npp", type: "clan", description: "Član gradskog odbora", from: "2012", to: null, source_label: "Sajt stranke (primer)" },
      { party: "npp", type: "funkcioner", description: "Odbornik u Skupštini grada", from: "2016", to: "2019", source_label: "Službeni list grada (primer)" },
      { party: "npp", type: "imenovanje", description: "Imenovan za direktora javnog preduzeća", from: "2019", to: null, source_label: "Rešenje Vlade, Službeni glasnik (primer)" },
    ],
    timeline: [
      ["2012", "Učlanjuje se u NPP"],
      ["2016", "Izabran za odbornika"],
      ["2019", "Imenovan za v.d. direktora JP „Vodovod Primer”"],
      ["2021", "Imenovan za direktora nakon konkursa"],
    ],
  },
  {
    slug: "milica-uzorkovic",
    name: "Milica Uzorković",
    aliases: ["Милица Узорковић"],
    role: "Narodna poslanica",
    city: "Novi Sad",
    born: "1981",
    summary: "Poslanica u drugom mandatu. Ranije pokrajinska sekretarka.",
    biography:
      "Pravnica po obrazovanju. Karijeru počela u advokatskoj kancelariji u Novom Sadu.\n\nOd 2014. u GLU, 2016–2020. pokrajinska sekretarka, od 2020. narodna poslanica.",
    net_worth: "oko 180.000 EUR",
    net_worth_source: "Imovinska karta, Agencija za sprečavanje korupcije (primer)",
    connections: [
      { party: "glu", type: "funkcioner", description: "Potpredsednica stranke", from: "2018", to: null, source_label: "Sajt stranke (primer)" },
      { party: "glu", type: "kandidat", description: "Nosilac liste za AP Vojvodinu", from: "2020", to: "2020", source_label: "Izborna lista, RIK (primer)" },
    ],
    timeline: [
      ["2014", "Učlanjuje se u GLU"],
      ["2016", "Pokrajinska sekretarka"],
      ["2020", "Izabrana za narodnu poslanicu"],
      ["2024", "Ponovo izabrana"],
    ],
  },
  {
    slug: "dragan-testic",
    name: "Dragan Testić",
    aliases: ["Драган Тестић"],
    role: "Vlasnik firme „Test Gradnja” d.o.o.",
    city: "Beograd",
    born: "1968",
    summary:
      "Privrednik čija je firma dobila više javnih nabavki. Prijavljen kao donator dve stranke.",
    biography:
      "Osnivač i većinski vlasnik građevinske firme „Test Gradnja” d.o.o. (2005).\n\nPrema izveštajima o finansiranju političkih aktivnosti, donirao je sredstva NPP i DST u izbornim godinama.",
    net_worth: "nije javno poznato",
    net_worth_source: "",
    connections: [
      { party: "npp", type: "donator", description: "Donacija u izbornoj kampanji", from: "2022", to: "2022", source_label: "Izveštaj o troškovima kampanje (primer)" },
      { party: "dst", type: "donator", description: "Donacija za redovan rad", from: "2018", to: "2018", source_label: "Godišnji finansijski izveštaj (primer)" },
    ],
    timeline: [
      ["2005", "Osniva „Test Gradnja” d.o.o."],
      ["2018", "Donacija DST"],
      ["2022", "Donacija NPP u kampanji"],
    ],
  },
  {
    slug: "ana-ogledalovic",
    name: "Ana Ogledalović",
    aliases: ["Ана Огледаловић"],
    role: "Predsednica opštine",
    city: "Užice",
    born: "1979",
    summary: "Predsednica opštine od 2022, prethodno u DST, sada u NPP.",
    biography:
      "Profesorka srpskog jezika. Odbornica DST od 2012. Prešla u NPP 2021, nakon čega je izabrana za predsednicu opštine.",
    net_worth: "oko 95.000 EUR",
    net_worth_source: "Imovinska karta, Agencija za sprečavanje korupcije (primer)",
    connections: [
      { party: "dst", type: "funkcioner", description: "Odbornica", from: "2012", to: "2021", source_label: "Službeni list opštine (primer)" },
      { party: "npp", type: "funkcioner", description: "Predsednica opštine", from: "2022", to: null, source_label: "Službeni list opštine (primer)" },
    ],
    timeline: [
      ["2012", "Izabrana za odbornicu (DST)"],
      ["2021", "Prelazi u NPP"],
      ["2022", "Izabrana za predsednicu opštine"],
    ],
  },
  {
    slug: "nikola-probic",
    name: "Nikola Probić",
    aliases: ["Никола Пробић"],
    role: "Član upravnog odbora Doma zdravlja",
    city: "Niš",
    born: "1990",
    summary: "Član upravnog odbora zdravstvene ustanove. Funkcioner omladine GLU.",
    biography:
      "Master menadžmenta. Predsednik gradske omladine GLU od 2019. Imenovan u upravni odbor Doma zdravlja 2023.",
    net_worth: "",
    net_worth_source: "",
    connections: [
      { party: "glu", type: "funkcioner", description: "Predsednik gradske omladine", from: "2019", to: null, source_label: "Sajt stranke (primer)" },
      { party: "glu", type: "imenovanje", description: "Član upravnog odbora Doma zdravlja", from: "2023", to: null, source_label: "Odluka Skupštine grada (primer)" },
    ],
    timeline: [
      ["2019", "Predsednik gradske omladine GLU"],
      ["2023", "Imenovan u upravni odbor Doma zdravlja"],
    ],
  },
];

export function seed(d: DatabaseSync) {
  const insParty = d.prepare(
    "INSERT INTO parties (slug, name, short, color) VALUES (?, ?, ?, ?)"
  );
  const partyId: Record<string, number> = {};
  for (const p of PARTIES) {
    partyId[p.slug] = Number(insParty.run(p.slug, p.name, p.short, p.color).lastInsertRowid);
  }

  const insPerson = d.prepare(`INSERT INTO persons
    (slug, name, name_norm, aliases, search_norm, role, city, born, summary, biography,
     net_worth, net_worth_source, status, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1)`);
  const insConn = d.prepare(`INSERT INTO connections
    (person_id, party_id, type, description, period_from, period_to, source_url, source_label)
    VALUES (?, ?, ?, ?, ?, ?, '#', ?)`);
  const insTl = d.prepare("INSERT INTO timeline (person_id, date, text) VALUES (?, ?, ?)");

  for (const p of PERSONS) {
    const id = Number(
      insPerson.run(
        p.slug, p.name, normalize(p.name), p.aliases.join(", "),
        normalize([p.name, ...p.aliases].join(" ")),
        p.role, p.city, p.born, p.summary, p.biography, p.net_worth, p.net_worth_source
      ).lastInsertRowid
    );
    for (const c of p.connections) {
      insConn.run(id, partyId[c.party], c.type, c.description, c.from, c.to, c.source_label);
    }
    for (const [date, text] of p.timeline) insTl.run(id, date, text);
  }
}
