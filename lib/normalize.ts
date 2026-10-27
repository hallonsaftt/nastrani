// Svodi ime na oblik pogodan za pretragu: ćirilica -> latinica, bez dijakritika,
// mala slova. "Ђорђе Јовановић", "Đorđe Jovanović" i "djordje jovanovic" daju isto.

const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e", ж: "z", з: "z",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o",
  п: "p", р: "r", с: "s", т: "t", ћ: "c", у: "u", ф: "f", х: "h", ц: "c",
  ч: "c", џ: "dz", ш: "s",
};

export function normalize(input: string): string {
  return Array.from(input.toLowerCase())
    .map((ch) => CYR[ch] ?? ch)
    .join("")
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input: string): string {
  return normalize(input).replace(/ /g, "-");
}
