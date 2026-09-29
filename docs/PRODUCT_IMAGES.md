# Product images

Every product renders through `ProductImage` (`components/Emoji.tsx`), which
picks the best thing available:

1. `product.image` — a real photo, if the product has one
2. otherwise, bundled vector artwork on the category's tint

If a photo URL 404s or fails to load, the tile falls back to the artwork
instead of showing a broken image, so the grid never breaks.

## Adding real photos

Set `image` on the product:

```ts
{
  id: "p1",
  name: "Tomatoes",
  image: "https://<project>.supabase.co/storage/v1/object/public/products/tomatoes.jpg",
  // ...
}
```

Any URL works — but put them in **Supabase Storage**, not a hotlinked stock
photo site. Hotlinks break without warning and most stock licences don't cover
commercial use.

```bash
# one-off upload, then paste the public URL into the product
supabase storage cp ./tomatoes.jpg ss://products/tomatoes.jpg
```

Shoot at **800×800 or larger, square**, on a plain background. The tiles crop to
square with `object-cover`, so anything else loses its edges.

`ProductImage` uses a plain `<img>` rather than `next/image` on purpose: these
URLs come from the database at runtime, and `next/image` would need every
hostname pre-declared in `next.config.ts`. If you later settle on one storage
host and want automatic resizing, switch it then.

## The vector artwork

The fallback art is [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0),
bundled in `public/emoji/` rather than drawn with the system emoji font — system
emoji look different on every phone, and render as flat monochrome on some
Androids.

After adding a product with a new emoji, re-run:

```bash
node scripts/fetch-emoji-art.mjs
```

It scans the source for emoji, downloads any it doesn't already have, and
reports anything Twemoji has no artwork for.
