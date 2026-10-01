# Product images

Every product renders through `ProductImage` and every category through
`CategoryImage` (both in `components/Emoji.tsx`), which pick the best thing
available:

1. `image` — a real photo, if it has one
2. otherwise, bundled vector artwork on the category's tint

If a photo URL 404s or fails to load, the tile falls back to the artwork
instead of showing a broken image, so the grid never breaks.

## The photos we ship

All 10 categories and 20 unbranded products (fresh produce, eggs, bread, rice,
sugar and so on) have real photos in `public/photos/`. They are Flickr photos
from Google's [Open Images](https://storage.googleapis.com/openimages/web/index.html)
dataset, licensed **CC BY 2.0**, cropped to the labelled object and resized —
each one picked and checked by eye.

CC BY needs credit, so every photo's author, title and source link is listed in
the app at **Account → Photo credits** (`/credits`, from `lib/photo-credits.ts`).

To change or add one, edit `scripts/photo-picks.json` and rebuild — it
regenerates the images and the credits list together:

```bash
pip install pillow
python3 scripts/build-photos.py
```

**Branded products (Mazoe, Coca-Cola, Dairibord, Lobels…) deliberately keep the
artwork.** A generic photo of "a juice" would show customers something other
than what they will receive. Those need real packshots — photograph the stock
in the dark store, or ask suppliers for theirs — uploaded per product as below.

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
