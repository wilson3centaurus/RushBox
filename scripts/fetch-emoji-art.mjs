/**
 * Downloads Twemoji vector art for every emoji used in the catalogue.
 *
 * System emoji render differently on every device — flat monochrome on some
 * Androids, wildly different shapes across platforms. Bundling the vectors
 * makes the product grid look identical everywhere.
 *
 * Twemoji graphics are CC-BY 4.0 (Twitter/X). Run: node scripts/fetch-emoji-art.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { glob } from "node:fs/promises";

const OUT = "public/emoji";
const BASE = "https://raw.githubusercontent.com/jdecked/twemoji/main/assets/svg";

/** Twemoji's own filename rule: codepoints joined by "-", variation selector dropped. */
function toCodePoint(emoji) {
  const stripped = emoji.includes("‍")
    ? emoji
    : emoji.replace(/️/g, "");
  return [...stripped].map((c) => c.codePointAt(0).toString(16)).join("-");
}

const emojiPattern =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}][\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}]*/gu;

const found = new Set();
for await (const file of glob(["app/**/*.tsx", "components/**/*.tsx", "lib/**/*.ts"])) {
  const text = await readFile(file, "utf8");
  for (const m of text.matchAll(emojiPattern)) found.add(m[0]);
}

await mkdir(OUT, { recursive: true });

let ok = 0;
const failed = [];

for (const emoji of found) {
  const cp = toCodePoint(emoji);
  const res = await fetch(`${BASE}/${cp}.svg`);
  if (!res.ok) {
    failed.push(`${emoji} (${cp}) -> ${res.status}`);
    continue;
  }
  await writeFile(`${OUT}/${cp}.svg`, await res.text());
  ok++;
}

console.log(`saved ${ok} svg files to ${OUT}/`);
if (failed.length) console.warn("missing:\n" + failed.join("\n"));
