"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const geocodeCache = new Map<string, { lat: number; lng: number }>();

async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  const key = query.trim();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(key)}&limit=1`,
      {
        headers: {
          "User-Agent": "RE-Network-Crowdfund/1.0 (project location map)",
        },
      }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { lat?: string; lon?: string }[];
    if (data?.length && data[0].lat && data[0].lon) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache.set(key, result);
      return result;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ProjectLocationMapProps = {
  location: string | null | undefined;
  title: string;
};

export default function ProjectLocationMap({ location, title }: ProjectLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">(
    location?.trim() ? "idle" : "empty"
  );

  useEffect(() => {
    if (!location?.trim()) {
      setStatus("empty");
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus("loading");
      const coords = await geocodeLocation(location);
      if (cancelled) return;
      if (!coords) {
        setStatus("error");
        return;
      }
      setStatus("ready");

      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled || !mapContainer.current) return;

      if (!map.current) {
        map.current = L.map(mapContainer.current, {
          center: [coords.lat, coords.lng],
          zoom: 11,
          scrollWheelZoom: true,
        });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map.current);
      } else {
        map.current.setView([coords.lat, coords.lng], 11);
      }

      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      markerRef.current = L.marker([coords.lat, coords.lng])
        .addTo(map.current)
        .bindPopup(`<strong>${escapeHtml(title)}</strong><br/>${escapeHtml(location)}`);

      map.current.invalidateSize();
    })();

    return () => {
      cancelled = true;
    };
  }, [location, title]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold">
          <MapPin className="w-5 h-5" />
          Project location
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        {status === "empty" && (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
            Map unavailable without a location.
          </div>
        )}
        {status === "error" && location?.trim() && (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 text-center text-sm text-muted-foreground">
            We couldn&apos;t place this address on the map. Try opening it in your maps app instead.
          </div>
        )}
        {location?.trim() && status !== "empty" && status !== "error" && (
          <div className="relative h-[220px] w-full overflow-hidden rounded-lg border bg-muted/10">
            {(status === "loading" || status === "idle") && (
              <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-2 bg-background/80 text-muted-foreground backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Finding location…</span>
              </div>
            )}
            <div ref={mapContainer} className="h-full w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
