import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, UserSimulatedLocation } from '../types/carpark';
import { formatDistance, estimateDriveMinutes } from '../utils/distance';

interface CarparkMapProps {
  carparks: Carpark[];
  userLocation: UserSimulatedLocation;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (cp: Carpark) => void;
  onQuickCalculate: (cp: Carpark) => void;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  userLocation,
  selectedCarpark,
  onSelectCarpark,
  onQuickCalculate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Singapore
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Clean CartoDB Positron tiles for high-precision analytical look
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Ensure map container renders properly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-7 h-7 bg-[#0049db] rounded-full opacity-30 animate-ping-subtle"></div>
        <div class="w-4 h-4 bg-[#0049db] border-2 border-white rounded-full shadow-md z-10"></div>
        <div class="absolute -bottom-5 bg-[#181b24] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
          Your Location
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([userLocation.coords.lat, userLocation.coords.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarkerRef.current = marker;
  }, [userLocation]);

  // Update Carpark Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    carparks.forEach((cp) => {
      const percentAvailable = Math.round((cp.availableLots / cp.totalLots) * 100);
      let bgColor = '#089981'; // Green
      let ringColor = '#84f7db';
      let textColor = '#ffffff';

      if (percentAvailable < 5 || cp.availableLots === 0) {
        bgColor = '#f23645'; // Red
        ringColor = '#ffdad6';
      } else if (percentAvailable <= 20) {
        bgColor = '#d97706'; // Amber
        ringColor = '#fde68a';
      }

      const isCurrentSelected = selectedCarpark?.id === cp.id;

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110 ${
          isCurrentSelected ? 'scale-125 z-50' : 'z-20'
        }">
          <div style="background-color: ${bgColor}; box-shadow: 0 0 0 2px ${ringColor}, 0 4px 6px -1px rgba(0, 0, 0, 0.2);" class="px-2 py-1 rounded-full flex items-center gap-1 text-white font-mono-num text-[11px] font-bold">
            <span>${cp.availableLots}</span>
            <span class="text-[9px] font-normal opacity-90">lots</span>
          </div>
          <div style="border-top-color: ${bgColor};" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'carpark-custom-pin',
        iconSize: [60, 32],
        iconAnchor: [30, 32],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
      });

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 w-64 text-[#181b24]';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-[10px] font-bold bg-[#ebedfa] text-[#181b24] px-1.5 py-0.5 rounded">
            ${cp.agency}
          </span>
          <span class="font-mono-num text-[10px] font-bold text-[#5a5e6b]">
            ${cp.carparkNumber}
          </span>
        </div>
        <h4 class="font-bold text-xs leading-snug line-clamp-2">${cp.name}</h4>
        <p class="text-[11px] text-[#5a5e6b] mt-0.5">${cp.address}</p>
        
        <div class="mt-2.5 p-2 bg-[#f8f9fd] rounded-lg border border-[#e0e3eb] flex items-center justify-between">
          <div>
            <span class="text-[9px] text-[#737687] block uppercase font-semibold">Available</span>
            <span class="text-base font-bold font-mono-num" style="color: ${bgColor};">
              ${cp.availableLots} <span class="text-[10px] text-[#737687]">/ ${cp.totalLots}</span>
            </span>
          </div>
          <div class="text-right">
            <span class="text-[9px] text-[#737687] block uppercase font-semibold">Day Rate</span>
            <span class="text-xs font-bold text-[#181b24]">S$${cp.rates.estimatedPerHourDay.toFixed(2)}/hr</span>
          </div>
        </div>

        <div class="mt-2 pt-2 border-t border-[#e0e3eb] flex items-center gap-1.5">
          <button id="btn-details-${cp.id}" class="cursor-pointer flex-1 py-1.5 bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold rounded text-center transition-colors">
            View Details
          </button>
          <button id="btn-calc-${cp.id}" class="cursor-pointer px-2.5 py-1.5 bg-[#f1f3ff] hover:bg-[#e0e2ee] text-[#0049db] text-xs font-semibold rounded text-center transition-colors">
            Calc Fee
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.on('popupopen', () => {
        const detailsBtn = document.getElementById(`btn-details-${cp.id}`);
        if (detailsBtn) {
          detailsBtn.onclick = (e) => {
            e.preventDefault();
            onSelectCarpark(cp);
          };
        }
        const calcBtn = document.getElementById(`btn-calc-${cp.id}`);
        if (calcBtn) {
          calcBtn.onclick = (e) => {
            e.preventDefault();
            onQuickCalculate(cp);
          };
        }
      });

      marker.addTo(markersGroup);
    });
  }, [carparks, selectedCarpark, onSelectCarpark, onQuickCalculate]);

  // Center on Selected Carpark if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCarpark) return;

    map.flyTo([selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng], 15, {
      duration: 1.2,
    });
  }, [selectedCarpark]);

  // Map Utility Action Handlers
  const handleRecenterSingapore = () => {
    mapInstanceRef.current?.flyTo([1.3521, 103.8198], 12);
  };

  const handleZoomToUser = () => {
    mapInstanceRef.current?.flyTo(
      [userLocation.coords.lat, userLocation.coords.lng],
      15
    );
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-[#f8f9fd]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Quick Actions */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button
          onClick={handleZoomToUser}
          className="cursor-pointer bg-white/95 backdrop-blur-sm border border-[#c3c5d8] hover:bg-white text-[#181b24] p-2 rounded-lg shadow-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Zoom to Simulated Driver Location"
        >
          <div className="w-2.5 h-2.5 bg-[#0049db] rounded-full animate-ping-subtle" />
          <span className="hidden sm:inline">My Location</span>
        </button>

        <button
          onClick={handleRecenterSingapore}
          className="cursor-pointer bg-white/95 backdrop-blur-sm border border-[#c3c5d8] hover:bg-white text-[#5a5e6b] hover:text-[#181b24] px-2 py-1.5 rounded-lg shadow-md text-xs font-medium transition-colors text-center"
          title="Fit whole Singapore Island"
        >
          All Singapore
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-sm border border-[#e0e3eb] rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#089981]" />
          <span className="text-[#434656]">&gt;20% Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
          <span className="text-[#434656]">5-20% Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f23645]" />
          <span className="text-[#434656]">&lt;5% / Full</span>
        </div>
      </div>
    </div>
  );
};
