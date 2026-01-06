"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Agency {
  id: string;
  name: string;
  company_name?: string;
  rating: number;
  reviews: number;
  location?: string;
  full_address?: string;
  logo_url?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

interface AgencyMapViewProps {
  agencies: Agency[];
  onMarkerClick?: (agencyId: string) => void;
  hoveredAgencyId?: string | null;
}

// ZIP code to coordinates mapping (fallback when geocoding fails)
const zipToCoordinates: Record<string, { lat: number; lng: number }> = {
  "10001": { lat: 40.7505, lng: -73.9934 },
  "10002": { lat: 40.7159, lng: -73.9848 },
  "10003": { lat: 40.7310, lng: -73.9967 },
  "10004": { lat: 40.6892, lng: -74.0445 },
  "10005": { lat: 40.7074, lng: -74.0113 },
  "10022": { lat: 40.7580, lng: -73.9694 },
  "90001": { lat: 33.9744, lng: -118.2481 },
  "90002": { lat: 33.9496, lng: -118.2471 },
  "90003": { lat: 33.9446, lng: -118.2726 },
  "90004": { lat: 34.0736, lng: -118.2984 },
  "90012": { lat: 34.0522, lng: -118.2437 },
  "90028": { lat: 34.1016, lng: -118.3356 },
  "90210": { lat: 34.0736, lng: -118.4004 },
  "94102": { lat: 37.7849, lng: -122.4094 },
  "60601": { lat: 41.8825, lng: -87.6441 },
  "33139": { lat: 25.7907, lng: -80.1300 },
};

// Geocoding cache
const geocodeCache = new Map<string, { lat: number; lng: number }>();

const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "RE-Network App",
        },
      }
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      geocodeCache.set(address, result);
      return result;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return null;
};

export default function AgencyMapView({ agencies, onMarkerClick, hoveredAgencyId }: AgencyMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userLocationMarkerRef = useRef<L.Layer | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request user's location
  useEffect(() => {
    if (navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        const defaultLocation = { lat: 40.730610, lng: -73.935242 };
        setUserLocation(defaultLocation);
        if (map.current) {
          map.current.setView([defaultLocation.lat, defaultLocation.lng], 11);
        }
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          
          if (map.current) {
            map.current.setView([location.lat, location.lng], 12);
            
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove();
            }
            const userIcon = L.divIcon({
              html: `<div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #3b82f6;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              className: "user-location-marker",
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            
            userLocationMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon })
              .addTo(map.current)
              .bindPopup("Your Location");
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          const defaultLocation = { lat: 40.730610, lng: -73.935242 };
          setUserLocation(defaultLocation);
          if (map.current) {
            map.current.setView([defaultLocation.lat, defaultLocation.lng], 11);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      const defaultLocation = { lat: 40.730610, lng: -73.935242 };
      setUserLocation(defaultLocation);
      if (map.current) {
        map.current.setView([defaultLocation.lat, defaultLocation.lng], 11);
      }
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: userLocation ? [userLocation.lat, userLocation.lng] : [40.730610, -73.935242],
      zoom: userLocation ? 12 : 11,
    });

    // Use CartoDB Voyager tiles (colorful style)
    const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
      errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    });
    
    tileLayer.addTo(map.current);
    
    tileLayer.on("tileerror", () => {
      if (!map.current) return;
      const fallbackLayer = L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png", {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        subdomains: "abcd",
        maxZoom: 18,
      });
      map.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.current!.removeLayer(layer);
        }
      });
      fallbackLayer.addTo(map.current);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = new Map();
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map center when user location is available
  useEffect(() => {
    if (map.current && userLocation && !markersRef.current.size) {
      map.current.setView([userLocation.lat, userLocation.lng], 12);
      
      if (!userLocationMarkerRef.current) {
        const userIcon = L.divIcon({
          html: `<div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: "user-location-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        
        userLocationMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map.current)
          .bindPopup("Your Location");
      }
    }
  }, [userLocation]);

  const geocodeAndAddMarkers = useCallback(async () => {
    if (!map.current || agencies.length === 0) return;

    setIsGeocoding(true);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);
    const markerData: Array<{ agency: Agency; lat: number; lng: number }> = [];

    for (const agency of agencies) {
      let lat: number | undefined;
      let lng: number | undefined;

      // Try to get coordinates from full_address first
      if (agency.full_address) {
        const coords = await geocodeAddress(agency.full_address);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      // Fallback to service areas
      if (!lat || !lng) {
        if (agency.serviceAreas && agency.serviceAreas.length > 0) {
          const zipCode = agency.serviceAreas[0].zip_code;
          if (zipToCoordinates[zipCode]) {
            lat = zipToCoordinates[zipCode].lat;
            lng = zipToCoordinates[zipCode].lng;
          } else if (agency.serviceAreas[0].lat && agency.serviceAreas[0].lng) {
            lat = agency.serviceAreas[0].lat;
            lng = agency.serviceAreas[0].lng;
          }
        }
      }

      // Final fallback to default location
      if (!lat || !lng) {
        lat = 40.730610;
        lng = -73.935242;
      }

      markerData.push({ agency, lat, lng });
      bounds.extend([lat, lng]);
    }

    // Add markers to map
    markerData.forEach(({ agency, lat, lng }) => {
      const isHovered = hoveredAgencyId === agency.id;
      const hasLogo = !!(agency.logo_url || agency.avatar_url);
      const initial = (agency.name || "?").charAt(0).toUpperCase();
      
      const iconHtml = `
        <div class="agency-marker-${agency.id}" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: ${isHovered ? '0 8px 16px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.6)' : '0 2px 4px rgba(0,0,0,0.3)'};
          ${hasLogo ? `background-image: url(${agency.logo_url || agency.avatar_url}); background-size: cover; background-position: center;` : 'background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px;'}
          cursor: pointer;
          transition: all 0.3s ease;
          transform: ${isHovered ? 'scale(1.15)' : 'scale(1)'};
          z-index: ${isHovered ? '1000' : '100'};
        ">
          ${hasLogo ? '' : initial}
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "agency-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${agency.name}</h3>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #fbbf24;">★</span>
              <span>${agency.rating.toFixed(1)} (${agency.reviews} ${agency.reviews === 1 ? 'review' : 'reviews'})</span>
            </div>
            ${agency.location ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">📍 ${agency.location}</p>` : ''}
            ${agency.email ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">✉️ ${agency.email}</p>` : ''}
          </div>
        `);

      marker.on("click", () => {
        if (onMarkerClick) {
          onMarkerClick(agency.id);
        }
      });

      markersRef.current.set(agency.id, marker);
    });

    // Fit bounds to show all markers
    if (markerData.length > 0 && map.current) {
      if (markerData.length === 1) {
        map.current.setView([markerData[0].lat, markerData[0].lng], 12);
      } else {
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    setIsGeocoding(false);
  }, [agencies, onMarkerClick, hoveredAgencyId]);

  useEffect(() => {
    geocodeAndAddMarkers();
  }, [geocodeAndAddMarkers]);

  // Update marker styles when hoveredAgencyId changes
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker, agencyId) => {
      const isHovered = hoveredAgencyId === agencyId;
      const element = document.querySelector(`.agency-marker-${agencyId}`);
      if (element && element instanceof HTMLElement) {
        element.style.transform = isHovered ? 'scale(1.15)' : 'scale(1)';
        element.style.boxShadow = isHovered
          ? '0 8px 16px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.6)'
          : '0 2px 4px rgba(0,0,0,0.3)';
        element.style.zIndex = isHovered ? '1000' : '100';
      }
    });
  }, [hoveredAgencyId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
      {isGeocoding && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading locations...</span>
        </div>
      )}
    </div>
  );
}

