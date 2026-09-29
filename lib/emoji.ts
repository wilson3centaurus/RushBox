/**
 * Twemoji's filename rule: codepoints joined by "-", with the variation
 * selector dropped unless the sequence is a ZWJ emoji.
 */
export function emojiSrc(emoji: string) {
  const stripped = emoji.includes("‍")
    ? emoji
    : emoji.replace(/️/g, "");
  const cp = [...stripped]
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("-");
  return `/emoji/${cp}.svg`;
}
