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

interface Service {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  provider_name: string;
  provider_avatar?: string;
  location?: string;
  full_address?: string;
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

interface ServiceMapViewProps {
  services: Service[];
  onMarkerClick?: (serviceId: string) => void;
  hoveredServiceId?: string | null;
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
  "78701": { lat: 30.2672, lng: -97.7431 },
  "98101": { lat: 47.6062, lng: -122.3321 },
  "02101": { lat: 42.3551, lng: -71.0656 },
  "85001": { lat: 33.4484, lng: -112.0740 },
  "80202": { lat: 39.7392, lng: -104.9903 },
  "92260": { lat: 33.8303, lng: -116.5453 },
};

// Geocoding function with retry and fallback
const geocodeAddress = async (address: string, zipCode?: string): Promise<{ lat: number; lng: number } | null> => {
  // First try ZIP code mapping (fastest, no API call)
  if (zipCode && zipToCoordinates[zipCode]) {
    return zipToCoordinates[zipCode];
  }

  // Extract ZIP from address if present
  const zipMatch = address.match(/\b\d{5}\b/);
  if (zipMatch && zipToCoordinates[zipMatch[0]]) {
    return zipToCoordinates[zipMatch[0]];
  }

  // Try geocoding API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "RE-Network App",
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const ServiceMapView = ({ services, onMarkerClick, hoveredServiceId }: ServiceMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userLocationMarkerRef = useRef<L.Layer | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
            userLocationMarkerRef.current = L.circleMarker([location.lat, location.lng], {
              radius: 8,
              fillColor: "#3388ff",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            }).addTo(map.current).bindPopup("Your Location");
          }
        },
        (error) => {
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
    if (map.current && userLocation) {
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

  useEffect(() => {
    if (!map.current || !services.length) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = new Map();

    setIsGeocoding(true);

    const geocodeAndAddMarkers = async () => {
      if (!map.current) {
        setIsGeocoding(false);
        return;
      }

      const bounds = L.latLngBounds([]);
      
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }

      const markerData: Array<{ service: Service; lat: number; lng: number; address: string }> = [];
      
      for (const service of services.filter((s) => s.full_address || s.serviceAreas?.length)) {
        let lat: number | null = null;
        let lng: number | null = null;
        let address = service.full_address || "";

        if (service.serviceAreas?.length) {
          const area = service.serviceAreas[0];
          if (area.lat && area.lng) {
            lat = area.lat;
            lng = area.lng;
          }
        }

        if (!lat || !lng) {
          if (service.full_address) {
            const zipMatch = service.full_address.match(/\b\d{5}\b/);
            const zipCode = zipMatch ? zipMatch[0] : service.serviceAreas?.[0]?.zip_code;
            
            if (zipCode && zipToCoordinates[zipCode]) {
              lat = zipToCoordinates[zipCode].lat;
              lng = zipToCoordinates[zipCode].lng;
            }
            
            await new Promise((resolve) => setTimeout(resolve, 200));
            const coords = await geocodeAddress(service.full_address, zipCode);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
            }
          }
        }

        if (!lat || !lng) {
          const zipCode = service.serviceAreas?.[0]?.zip_code;
          if (zipCode && zipToCoordinates[zipCode]) {
            lat = zipToCoordinates[zipCode].lat;
            lng = zipToCoordinates[zipCode].lng;
          }
        }

        if (!lat || !lng) {
          const baseLocation = userLocation || { lat: 40.730610, lng: -73.935242 };
          lat = baseLocation.lat + (Math.random() - 0.5) * 0.1;
          lng = baseLocation.lng + (Math.random() - 0.5) * 0.1;
        }

        markerData.push({ service, lat, lng, address });
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = new Map();

      if (!map.current) {
        setIsGeocoding(false);
        return;
      }

      markerData.forEach(({ service, lat, lng, address }) => {
        if (!map.current) return;

        const isHovered = hoveredServiceId === service.id;
        const hasAvatar = !!service.provider_avatar;
        const initial = (service.provider_name || "?").charAt(0).toUpperCase();
        
        const iconHtml = `
          <div class="service-marker-${service.id}" style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: ${isHovered ? '0 8px 16px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.6)' : '0 2px 4px rgba(0,0,0,0.3)'};
            ${hasAvatar ? `background-image: url(${service.provider_avatar}); background-size: cover; background-position: center;` : 'background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px;'}
            cursor: pointer;
            transition: all 0.3s ease;
            transform: ${isHovered ? 'scale(1.15)' : 'scale(1)'};
            z-index: ${isHovered ? '1000' : '100'};
          ">
            ${hasAvatar ? '' : initial}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: `custom-service-marker service-marker-${service.id}`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat, lng], { icon: customIcon, zIndexOffset: isHovered ? 1000 : 100 }).addTo(map.current);

        markersRef.current.set(service.id, marker);

        const popupContent = `
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${service.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${service.category}</p>
            ${address ? `<p style="font-size: 11px; color: #888; margin-bottom: 4px;">📍 ${address}</p>` : ""}
            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; margin-bottom: 4px;">
              <span>⭐</span>
              <span>${service.rating.toFixed(1)}</span>
            </div>
            <p style="font-size: 12px; font-weight: semibold; color: #10b981; margin-top: 4px;">$${service.price}</p>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onMarkerClick) {
            onMarkerClick(service.id);
          }
        });

        bounds.extend([lat, lng]);
      });

      if (map.current && bounds.isValid()) {
        map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } else if (map.current && userLocation) {
        map.current.setView([userLocation.lat, userLocation.lng], 12);
      }
      
      setIsGeocoding(false);
    };

    geocodeAndAddMarkers();
  }, [services, onMarkerClick, userLocation, hoveredServiceId]);

  // Update marker styles when hover state changes
  useEffect(() => {
    markersRef.current.forEach((marker, serviceId) => {
      const isHovered = hoveredServiceId === serviceId;
      const iconElement = marker.getElement();
      if (iconElement) {
        const markerDiv = iconElement.querySelector(`.service-marker-${serviceId}`) as HTMLElement;
        if (markerDiv) {
          markerDiv.style.boxShadow = isHovered
            ? '0 8px 16px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.6)'
            : '0 2px 4px rgba(0,0,0,0.3)';
          markerDiv.style.transform = isHovered ? 'scale(1.15)' : 'scale(1)';
          markerDiv.style.zIndex = isHovered ? '1000' : '100';
        }
        marker.setZIndexOffset(isHovered ? 1000 : 100);
      }
    });
  }, [hoveredServiceId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" style={{ zIndex: 0 }} />
      {isGeocoding && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <p className="text-muted-foreground">Geocoding addresses...</p>
        </div>
      )}
      {!isGeocoding && services.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <p className="text-muted-foreground">No services to display on map</p>
        </div>
      )}
    </div>
  );
};

export default ServiceMapView;

