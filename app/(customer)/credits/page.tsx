import { TopBar, Card } from "@/components/ui";
import { PHOTO_CREDITS, PHOTO_LICENSE } from "@/lib/photo-credits";

export const metadata = { title: "Photo credits · RushBox" };

export default function Credits() {
  return (
    <div>
      <TopBar title="Photo credits" back />

      <main className="px-5 py-5 space-y-4">
        <p className="text-sm text-ink-500">
          Product and category photos are from Flickr via Google&apos;s Open
          Images dataset, used under{" "}
          <a
            href={PHOTO_LICENSE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-600 underline"
          >
            {PHOTO_LICENSE.name}
          </a>
          . We cropped and resized them. They show the kind of item, not the
          exact product you will receive.
        </p>

        <Card className="divide-y divide-ink-100">
          {PHOTO_CREDITS.map((c) => (
            <a
              key={c.file}
              href={c.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 hover:bg-ink-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static file */}
              <img
                src={c.file}
                alt=""
                loading="lazy"
                className="w-12 h-12 rounded-lg object-cover shrink-0 bg-ink-100"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-xs text-ink-500 truncate">by {c.author}</p>
              </div>
            </a>
          ))}
        </Card>

        <p className="text-xs text-ink-400">
          Illustrations are Twemoji by Twitter and contributors, CC BY 4.0.
        </p>
      </main>
    </div>
  );
}
