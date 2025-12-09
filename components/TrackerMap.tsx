import React, { useEffect, useRef } from 'react';
import { Device, DeviceStatus } from '../types';

// Declare L for TypeScript since we are loading it from CDN in index.html
declare const L: any;

interface TrackerMapProps {
  devices: Device[];
  onDeviceSelect: (device: Device) => void;
}

const TrackerMap: React.FC<TrackerMapProps> = ({ devices, onDeviceSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Create map centered on a neutral global view initially
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true
      }).setView([20, 0], 2);

      // Add Dark Matter tiles for that "Cyber Security" look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Cleanup function
    return () => {
       if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Track current device IDs to identify removals
    const currentIds = new Set(devices.map(d => d.id));

    // Remove markers for devices that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    const formatDuration = (ms: number) => {
      const hours = Math.floor(ms / 3600000);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}d ${hours % 24}h`;
      return `${hours}h ${(Math.floor(ms / 60000) % 60)}m`;
    };

    // Add or Update markers
    devices.forEach(device => {
      // Determine colors based on status and risk
      const isCritical = device.status === DeviceStatus.CRITICAL || device.riskLevel === 'High';
      const isWarning = device.status === DeviceStatus.WARNING || device.riskLevel === 'Medium';
      
      const colorClass = isCritical ? 'bg-rose-500 shadow-rose-500/50' : 
                         isWarning ? 'bg-amber-500 shadow-amber-500/50' : 
                         'bg-emerald-500 shadow-emerald-500/50';

      const pulseClass = device.status === DeviceStatus.ONLINE ? 'animate-ping' : '';

      // Create a custom HTML icon using Tailwind classes
      const iconHtml = `
        <div class="relative w-4 h-4 group">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass} ${colorClass.split(' ')[0]}"></span>
          <div class="relative flex items-center justify-center w-4 h-4 rounded-full shadow-lg ${colorClass}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-marker-wrapper', // Empty class to avoid default styles
        html: iconHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
      });

      const popupContent = `
        <div class="min-w-[160px]">
            <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-slate-900">${device.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}">${device.riskLevel}</span>
            </div>
            <div class="text-xs text-slate-500 font-mono mb-2">${device.macAddress}</div>
            <div class="grid grid-cols-2 gap-2 text-xs border-t pt-2 border-slate-200">
                <div>
                    <span class="block text-slate-400 text-[10px] uppercase">Zone</span>
                    <span class="font-medium text-slate-700">${device.zone}</span>
                </div>
                <div>
                    <span class="block text-slate-400 text-[10px] uppercase">Status</span>
                    <span class="font-medium ${device.status === DeviceStatus.ONLINE ? 'text-emerald-600' : 'text-slate-600'}">${device.status}</span>
                </div>
            </div>
            <div class="mt-2 text-[10px] text-slate-500">
                Active for: <span class="font-mono font-medium">${formatDuration(Date.now() - device.firstSeen)}</span>
            </div>
            <div class="mt-1 text-[10px] text-slate-400 truncate">${device.latitude.toFixed(4)}, ${device.longitude.toFixed(4)}</div>
        </div>
      `;

      if (markersRef.current[device.id]) {
        // Update existing marker
        const marker = markersRef.current[device.id];
        const currentLatLng = marker.getLatLng();
        
        // Only update if moved to avoid jitter
        if (currentLatLng.lat !== device.latitude || currentLatLng.lng !== device.longitude) {
            marker.setLatLng([device.latitude, device.longitude]);
        }
        
        marker.setIcon(customIcon);
        // Only update content if popup is not open to avoid flicker, or update robustly
        // Leaflet's setContent works well even if open.
        marker.getPopup().setContent(popupContent);
      } else {
        // Create new marker
        const marker = L.marker([device.latitude, device.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent)
          .on('click', () => onDeviceSelect(device));
        
        markersRef.current[device.id] = marker;
      }
    });
    
  }, [devices, onDeviceSelect]);


  return (
    <div className="w-full h-full p-6 flex flex-col">
       <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Global Threat Map</h2>
          <p className="text-slate-400 text-sm">
            Real-time geospatial tracking of all connected assets.
          </p>
        </div>
        <div className="flex space-x-4 text-xs text-slate-400">
          <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>Server</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>Safe</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span>Critical</div>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden shadow-2xl shadow-black/50 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Overlay for map attribution styling if needed, or status overlays */}
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg">
             <div className="flex items-center space-x-2 text-xs text-emerald-400">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono">LIVE FEED ACTIVE</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerMap;