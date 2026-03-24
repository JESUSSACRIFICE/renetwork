"use client";

import Image from "next/image";
import { ArrowUp } from "lucide-react";

interface AdBlockProps {
  badgeText: string;
  /** Shown when no background image */
  icon?: string;
  /** Full-bleed photo */
  backgroundImage?: string;
  imageAlt?: string;
}

export const AdBlock = ({
  badgeText,
  icon,
  backgroundImage,
  imageAlt = "",
}: AdBlockProps) => {
  /** One treatment for label + icon: readable on light or dark hero areas. */
  const ctaClass =
    "text-amber-50 decoration-amber-50/90 [text-shadow:0_0_12px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.95)]";

  return (
    <div className="flex w-full lg:w-[180px] flex-col shrink-0">
      <div className="group relative h-[200px] sm:h-[250px] w-full cursor-pointer overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={imageAlt}
            fill
            className="object-cover z-0 transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="180px"
          />
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-800">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                {icon ? (
                  <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">{icon}</span>
                  </div>
                ) : null}
                <span className="text-white/90 text-xs font-medium">Advertisement Space</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className={`mt-2 flex w-full max-w-full items-center justify-start gap-1 border-0 bg-black/55 px-2 py-1.5 text-left text-xs font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${ctaClass}`}
      >
        <span className="underline underline-offset-2 decoration-2">{badgeText}</span>
        <ArrowUp
          className="size-3.5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          aria-hidden
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
};
