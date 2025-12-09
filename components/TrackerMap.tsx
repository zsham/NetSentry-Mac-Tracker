import React, { useMemo } from 'react';
import { Device, Zone, DeviceStatus } from '../types';

interface TrackerMapProps {
  devices: Device[];
  onDeviceSelect: (device: Device) => void;
}

// Define the geographical bounds of our "Facility"
// This maps the Lat/Lng world to our 0-100% css container
// Mock Location: Downtown LA Industrial District
const FACILITY_BOUNDS = {
  north: 34.0528, // Top (0% Y)
  south: 34.0520, // Bottom (100% Y)
  west: -118.2445, // Left (0% X)
  east: -118.2430  // Right (100% X)
};

const TrackerMap: React.FC<TrackerMapProps> = ({ devices, onDeviceSelect }) => {
  // A simplified floor plan grid system
  const getZoneCoordinates = (zone: Zone) => {
    switch (zone) {
      case Zone.SERVER_ROOM: return { x: 15, y: 15, w: 20, h: 25, color: 'rgba(99, 102, 241, 0.1)' };
      case Zone.OFFICE_NORTH: return { x: 40, y: 10, w: 55, h: 35, color: 'rgba(16, 185, 129, 0.1)' };
      case Zone.OFFICE_SOUTH: return { x: 40, y: 50, w: 55, h: 35, color: 'rgba(16, 185, 129, 0.1)' };
      case Zone.LOBBY: return { x: 5, y: 45, w: 30, h: 40, color: 'rgba(245, 158, 11, 0.1)' };
      case Zone.WAREHOUSE: return { x: 5, y: 88, w: 90, h: 10, color: 'rgba(100, 116, 139, 0.1)' };
      default: return { x: 0, y: 0, w: 100, h: 100, color: 'transparent' };
    }
  };

  const zones = Object.values(Zone).filter(z => z !== Zone.PARKING_LOT && z !== Zone.UNKNOWN);

  // Helper to project lat/lng to % x/y
  const getPosition = (lat: number, lng: number) => {
    const latRange = FACILITY_BOUNDS.north - FACILITY_BOUNDS.south;
    const lngRange = FACILITY_BOUNDS.east - FACILITY_BOUNDS.west;

    // Calculate percentage (0-100)
    // Longitude increases West to East
    let x = ((lng - FACILITY_BOUNDS.west) / lngRange) * 100;
    
    // Latitude increases South to North (but Y goes down on screen)
    // So if lat is max (North), Y should be 0.
    let y = ((FACILITY_BOUNDS.north - lat) / latRange) * 100;

    // Clamp values to keep inside map visually even if slightly out of bounds
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    return { x, y };
  };

  return (
    <div className="w-full h-full p-6 flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Live Geo-Spatial Map</h2>
          <p className="text-slate-400 text-sm">
            Facility Bounds: {FACILITY_BOUNDS.north.toFixed(4)}N, {FACILITY_BOUNDS.west.toFixed(4)}W
          </p>
        </div>
        <div className="flex space-x-4 text-xs text-slate-400">
          <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>Server</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>Office</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>Public</div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden shadow-2xl shadow-black/50">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#475569 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        ></div>

        {/* Zones */}
        {zones.map((zone) => {
          const dims = getZoneCoordinates(zone);
          return (
            <div
              key={zone}
              className="absolute border border-slate-700/50 flex items-center justify-center pointer-events-none"
              style={{
                left: `${dims.x}%`,
                top: `${dims.y}%`,
                width: `${dims.w}%`,
                height: `${dims.h}%`,
                backgroundColor: dims.color,
              }}
            >
              <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">{zone}</span>
            </div>
          );
        })}

        {/* Devices */}
        {devices.map((device) => {
          const pos = getPosition(device.latitude, device.longitude);
          return (
            <div
              key={device.id}
              onClick={() => onDeviceSelect(device)}
              className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out hover:scale-125 hover:z-50"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              {/* Ping Animation */}
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                device.status === DeviceStatus.CRITICAL ? 'bg-rose-500' : 'bg-emerald-500'
              }`}></span>
              
              {/* Device Dot */}
              <div className={`relative flex items-center justify-center w-4 h-4 rounded-full shadow-lg ${
                 device.status === DeviceStatus.CRITICAL ? 'bg-rose-500 shadow-rose-500/50' : 
                 device.status === DeviceStatus.WARNING ? 'bg-amber-500 shadow-amber-500/50' :
                 'bg-emerald-500 shadow-emerald-500/50'
              }`}>
                 {device.riskLevel === 'High' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-slate-900"></span>}
              </div>

              {/* Tooltip */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-56 bg-slate-800 text-xs rounded shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-slate-700">
                <div className="font-bold text-white mb-1">{device.name}</div>
                <div className="text-slate-400 font-mono text-[10px] mb-1">{device.macAddress}</div>
                <div className="text-indigo-400 font-mono text-[9px] mb-2">
                    {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1">
                  <span className={device.status === DeviceStatus.ONLINE ? 'text-emerald-400' : 'text-slate-500'}>{device.status}</span>
                  <span className="text-slate-500">{device.signalStrength}dBm</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Scanner Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-[scan_4s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
        </div>
        <style>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TrackerMap;