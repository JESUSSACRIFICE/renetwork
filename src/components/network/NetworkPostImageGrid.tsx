"use client";

/**
 * Uses native <img> so feed photos always load from Supabase Storage.
 * next/image requires remotePatterns built from env at compile time; a missing
 * NEXT_PUBLIC_SUPABASE_URL at dev/build start breaks optimized images silently.
 */
export function NetworkPostImageGrid({
  urls,
  priority,
}: {
  urls: string[];
  priority?: boolean;
}) {
  if (!urls.length) return null;

  const list = urls;

  if (list.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg bg-muted/40 border border-border/50">
        <div className="relative aspect-[1.85/1] w-full max-h-[460px] min-h-[200px]">
          <img
            src={list[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      </div>
    );
  }

  if (list.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
        {list.map((url, i) => (
          <div key={url} className="relative aspect-square min-h-[140px] bg-muted/50">
            <img
              src={url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={priority && i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
        <div className="relative aspect-square min-h-[140px] bg-muted/50">
          <img
            src={list[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <div className="relative aspect-square min-h-[140px] bg-muted/50">
          <img
            src={list[1]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="relative col-span-2 aspect-[2/1] min-h-[160px] bg-muted/50">
          <img
            src={list[2]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  const display = urls.slice(0, 4);
  const moreCount = urls.length > 4 ? urls.length - 4 : 0;
  return (
    <div className="mt-3 grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
      {display.map((url, slot) => {
        const showOverlay = slot === 3 && moreCount > 0;
        return (
          <div key={`${url}-${slot}`} className="relative aspect-square min-h-[120px] bg-muted/50">
            <img
              src={url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={priority && slot === 0 ? "eager" : "lazy"}
              decoding="async"
            />
            {showOverlay && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
                +{moreCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
