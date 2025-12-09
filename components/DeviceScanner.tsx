import React, { useState, useEffect } from 'react';
import { Device, DeviceStatus, Zone, MacAnalysisResult } from '../types';
import { analyzeMacAddress } from '../services/geminiService';

interface DeviceScannerProps {
  devices: Device[];
  onAddDevice: (device: Device) => void;
  onUpdateDevice: (device: Device) => void;
}

const DeviceScanner: React.FC<DeviceScannerProps> = ({ devices, onAddDevice, onUpdateDevice }) => {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [now, setNow] = useState(Date.now());
  
  // Scanner State
  const [scanMac, setScanMac] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MacAnalysisResult | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mac: '',
    type: '',
    manufacturer: '',
    zone: Zone.LOBBY,
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High',
    notes: '',
    latitude: '34.0524',
    longitude: '-118.2437'
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  // Update "now" every minute to refresh relative times
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset form when switching modes
  useEffect(() => {
    if (mode === 'manual') {
      setFormData({
        name: '',
        mac: '',
        type: 'Generic Device',
        manufacturer: 'Unknown',
        zone: Zone.LOBBY,
        riskLevel: 'Low',
        notes: '',
        latitude: '34.0524',
        longitude: '-118.2437'
      });
      setAnalysisResult(null);
      setScanMac('');
    }
  }, [mode]);

  const handleAnalyze = async () => {
    if (!scanMac) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMacAddress(scanMac);
      setAnalysisResult(result);
      
      // Pre-fill form for review
      setFormData({
        name: `${result.manufacturer} ${result.deviceType}`,
        mac: scanMac,
        type: result.deviceType,
        manufacturer: result.manufacturer,
        zone: Zone.UNKNOWN, // Let system triangulation determine or user set
        riskLevel: result.securityRisk.includes('High') ? 'High' : result.securityRisk.includes('Medium') ? 'Medium' : 'Low',
        notes: result.likelyUsage,
        latitude: (34.0524 + (Math.random() * 0.0004 - 0.0002)).toFixed(6), // Randomize slightly for scan
        longitude: (-118.2437 + (Math.random() * 0.0004 - 0.0002)).toFixed(6)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve location. Please allow permissions.");
        setGettingLocation(false);
      }
    );
  };

  const handleRegister = () => {
    const timestamp = Date.now();
    const newDevice: Device = {
      id: Math.random().toString(36).substr(2, 9),
      macAddress: formData.mac || '00:00:00:00:00:00',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254)}`,
      name: formData.name || 'Unnamed Device',
      manufacturer: formData.manufacturer,
      type: formData.type,
      status: DeviceStatus.ONLINE,
      zone: formData.zone,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      lastSeen: timestamp,
      firstSeen: timestamp,
      signalStrength: -Math.floor(Math.random() * 40 + 30),
      riskLevel: formData.riskLevel,
      notes: formData.notes,
    };

    onAddDevice(newDevice);
    
    // Reset states
    if (mode === 'scan') {
        setScanMac('');
        setAnalysisResult(null);
    } else {
        // Clear manual form but keep mode
        setFormData({
            name: '',
            mac: '',
            type: 'Generic Device',
            manufacturer: 'Unknown',
            zone: Zone.LOBBY,
            riskLevel: 'Low',
            notes: '',
            latitude: '34.0524',
            longitude: '-118.2437'
        });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper formats
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Panel: Tabs & Forms */}
        <div className="w-full xl:w-1/3 space-y-6">
          <div className="bg-slate-800 rounded-xl p-1 border border-slate-700 flex text-sm font-medium mb-4">
              <button 
                onClick={() => setMode('scan')}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'scan' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                AI Smart Scan
              </button>
              <button 
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Manual Register
              </button>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
            {mode === 'scan' ? (
                <>
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Identify & Track
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Target MAC Address</label>
                            <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={scanMac}
                                onChange={(e) => setScanMac(e.target.value)}
                                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !scanMac}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                {isAnalyzing ? '...' : 'Analyze'}
                            </button>
                            </div>
                        </div>

                        {analysisResult && (
                            <div className="bg-slate-900/50 rounded-lg p-4 border border-indigo-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h4 className="text-sm font-semibold text-indigo-400 mb-3">Analysis Complete - Verify Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Device Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Type</label>
                                            <input 
                                                type="text" 
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Risk Level</label>
                                            <select 
                                                value={formData.riskLevel}
                                                onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic pt-2">
                                        "{formData.notes}"
                                    </p>
                                </div>
                                <button 
                                    onClick={handleRegister}
                                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add to Tracker
                                </button>
                            </div>
                        )}
                        
                        {!analysisResult && (
                            <div className="pt-4 border-t border-slate-700/50">
                                <div className="text-xs text-slate-500">
                                    <p className="mb-2 font-semibold">How it works:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Enter a device MAC address</li>
                                        <li>AI identifies manufacturer & security profile</li>
                                        <li>System triangulates signal location (Simulated)</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                        <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Manual Registration
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Device Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g. Reception Printer"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">MAC Address</label>
                            <input 
                                type="text" 
                                value={formData.mac}
                                onChange={(e) => handleInputChange('mac', e.target.value)}
                                placeholder="00:00:00:00:00:00"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                <input 
                                    type="text" 
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Zone</label>
                                <select 
                                    value={formData.zone}
                                    onChange={(e) => handleInputChange('zone', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {Object.values(Zone).map(z => (
                                        <option key={z} value={z}>{z}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Location Inputs */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-400">Location (GPS)</label>
                                <button 
                                    onClick={handleGetLocation}
                                    disabled={gettingLocation}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                                >
                                    {gettingLocation ? (
                                        <span className="animate-pulse">Locating...</span>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Get Current Location
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input 
                                        type="number"
                                        step="0.000001"
                                        placeholder="Lat"
                                        value={formData.latitude}
                                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <input 
                                        type="number"
                                        step="0.000001"
                                        placeholder="Long"
                                        value={formData.longitude}
                                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Risk Level</label>
                            <div className="flex gap-4 mt-2">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <label key={level} className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="riskLevel"
                                            value={level}
                                            checked={formData.riskLevel === level}
                                            onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                                            className="form-radio text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                                        />
                                        <span className={`ml-2 text-sm ${level === 'High' ? 'text-rose-400' : level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleRegister}
                            disabled={!formData.name || !formData.mac}
                            className="w-full mt-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors border border-slate-600"
                        >
                            Register Device Manually
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>

        {/* Right Panel: Device Table */}
        <div className="w-full xl:w-2/3 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Tracked Assets</h3>
                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-mono">{devices.length} Active</span>
            </div>
            
            <div className="overflow-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Device Info</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Activity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Signal</th>
                            <th className="px-6 py-4">Risk</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {devices.map((device) => (
                            <tr key={device.id} className="hover:bg-slate-700/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{device.name}</span>
                                        <span className="font-mono text-xs text-slate-500">{device.macAddress}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 w-fit mb-1">
                                            {device.zone}
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-500">
                                            {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-indigo-300 font-medium">
                                            Active: {formatDuration(now - device.firstSeen)}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Last seen: {formatRelativeTime(device.lastSeen)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                            device.status === DeviceStatus.ONLINE ? 'bg-emerald-500' : 'bg-slate-500'
                                        }`}></div>
                                        <span className="text-sm text-slate-300">{device.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 w-16 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="bg-indigo-500 h-full rounded-full" 
                                                style={{width: `${Math.min(100, (100 + device.signalStrength) * 2)}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-500 w-12">{device.signalStrength}dBm</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold ${
                                        device.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'
                                    }`}>
                                        {device.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {devices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No devices tracked. Scan a MAC address to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceScanner;