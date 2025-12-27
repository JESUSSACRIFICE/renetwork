import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServiceListing {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: number;
  location: string;
  roles: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

interface MapViewProps {
  services: ServiceListing[];
  onMarkerClick?: (serviceId: string) => void;
}

const MapView = ({ services, onMarkerClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState(
    localStorage.getItem("mapbox_token") || ""
  );
  const [tokenInput, setTokenInput] = useState("");
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !services.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Create GeoJSON for clustering
    const features = services
      .filter((service) => service.serviceAreas?.length)
      .map((service) => {
        const area = service.serviceAreas![0];
        // Mock coordinates based on ZIP (in production, use geocoding API)
        const lat = area.lat || 39.8283 + (Math.random() - 0.5) * 20;
        const lng = area.lng || -98.5795 + (Math.random() - 0.5) * 40;

        return {
          type: "Feature" as const,
          properties: {
            id: service.id,
            title: service.title,
            provider: service.provider,
            rating: service.rating,
            price: service.price,
            radius: area.radius_miles,
            zip: area.zip_code,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
        };
      });

    // Wait for map to load
    if (!map.current.loaded()) {
      map.current.on("load", () => addMarkersAndClusters(features));
    } else {
      addMarkersAndClusters(features);
    }
  }, [services]);

  const addMarkersAndClusters = (features: any[]) => {
    if (!map.current) return;

    // Add source for clustering
    if (map.current.getSource("professionals")) {
      (map.current.getSource("professionals") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features,
      });
    } else {
      map.current.addSource("professionals", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }

    // Add cluster circles
    if (!map.current.getLayer("clusters")) {
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "professionals",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "hsl(var(--primary))",
            10,
            "hsl(var(--secondary))",
            30,
            "hsl(var(--accent))",
          ],
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
          "circle-opacity": 0.8,
        },
      });
    }

    // Add cluster count
    if (!map.current.getLayer("cluster-count")) {
      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "professionals",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });
    }

    // Add service area circles
    if (!map.current.getLayer("service-areas")) {
      map.current.addLayer({
        id: "service-areas",
        type: "circle",
        source: "professionals",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "hsl(var(--primary))",
          "circle-opacity": 0.1,
          "circle-radius": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            0,
            0,
            10,
            ["*", ["get", "radius"], 5],
            15,
            ["*", ["get", "radius"], 50],
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "hsl(var(--primary))",
          "circle-stroke-opacity": 0.3,
        },
      });
    }

    // Add unclustered points
    if (!map.current.getLayer("unclustered-point")) {
      map.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "professionals",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "hsl(var(--primary))",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    }

    // Click handlers
    map.current.on("click", "clusters", (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      (map.current.getSource("professionals") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || !map.current) return;
          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom,
          });
        }
      );
    });

    map.current.on("click", "unclustered-point", (e) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const { title, provider, rating, price, zip, radius } = feature.properties;

      new mapboxgl.Popup()
        .setLngLat((feature.geometry as any).coordinates)
        .setHTML(
          `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${title}</h3>
            <p class="text-xs text-gray-600 mb-2">${provider}</p>
            <div class="flex items-center gap-1 text-xs mb-1">
              <span>⭐ ${rating.toFixed(1)}</span>
            </div>
            <p class="text-xs text-gray-600">ZIP: ${zip} (${radius} mi)</p>
            <p class="text-xs font-semibold text-primary mt-1">$${price}/hr</p>
          </div>
        `
        )
        .addTo(map.current!);

      if (onMarkerClick) {
        onMarkerClick(feature.properties.id);
      }
    });

    // Change cursor on hover
    map.current.on("mouseenter", "clusters", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "clusters", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mouseenter", "unclustered-point", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "unclustered-point", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });

    // Fit bounds to show all markers
    if (features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach((feature) => {
        bounds.extend(feature.geometry.coordinates as [number, number]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem("mapbox_token", tokenInput);
    setMapboxToken(tokenInput);
  };

  if (!mapboxToken) {
    return (
      <div className="bg-card rounded-xl border p-8 flex flex-col items-center justify-center min-h-[500px]">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          To view the map with service areas, please enter your Mapbox public token.
          Get one free at{" "}
          <a
            href="https://mapbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
        <div className="w-full max-w-md space-y-3">
          <div>
            <Label htmlFor="token">Mapbox Public Token</Label>
            <Input
              id="token"
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <button
            onClick={handleSaveToken}
            disabled={!tokenInput}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            Save & Load Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
      {services.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-muted-foreground">No professionals to display on map</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
