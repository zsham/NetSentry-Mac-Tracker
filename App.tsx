import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TrackerMap from './components/TrackerMap';
import DeviceScanner from './components/DeviceScanner';
import Login from './components/Login';
import { Device, DeviceStatus, Zone, User } from './types';
import { generateSecurityReport } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Initial devices distributed globally to demonstrate world map
  // Use a function to generate dates relative to "now" on mount
  const getInitialDevices = (): Device[] => {
    const now = Date.now();
    return [
      {
        id: '1',
        macAddress: 'A4:C3:F0:89:12:34',
        ipAddress: '192.168.1.105',
        name: 'HQ Server Node',
        manufacturer: 'Dell Inc.',
        type: 'Server',
        status: DeviceStatus.ONLINE,
        zone: Zone.SERVER_ROOM,
        lastSeen: now,
        firstSeen: now - 3600000 * 24 * 5, // 5 days ago
        signalStrength: -45,
        latitude: 34.0522, // Los Angeles
        longitude: -118.2437,
        riskLevel: 'Low',
        notes: 'Main backend infrastructure'
      },
      {
        id: '2',
        macAddress: '00:1B:44:11:3A:B7',
        ipAddress: '10.0.5.20',
        name: 'NYC Branch IoT',
        manufacturer: 'Espressif Inc.',
        type: 'Smart Sensor',
        status: DeviceStatus.WARNING,
        zone: Zone.LOBBY,
        lastSeen: now - 1000 * 60 * 5, // 5 minutes ago
        firstSeen: now - 3600000 * 48, // 2 days ago
        signalStrength: -72,
        latitude: 40.7128, // New York
        longitude: -74.0060,
        riskLevel: 'Medium',
        notes: 'Unauthorized firmware version'
      },
      {
        id: '3',
        macAddress: 'BC:D1:12:88:99:00',
        ipAddress: '172.16.0.45',
        name: 'London Workstation',
        manufacturer: 'Apple, Inc.',
        type: 'MacBook Pro',
        status: DeviceStatus.ONLINE,
        zone: Zone.OFFICE_NORTH,
        lastSeen: now - 1000 * 60, // 1 minute ago
        firstSeen: now - 3600000 * 3, // 3 hours ago
        signalStrength: -55,
        latitude: 51.5074, // London
        longitude: -0.1278,
        riskLevel: 'Low',
        notes: 'Remote developer asset'
      },
      {
        id: '4',
        macAddress: '11:22:33:44:55:66',
        ipAddress: '192.168.50.10',
        name: 'Tokyo Gateway',
        manufacturer: 'Cisco Systems',
        type: 'Router',
        status: DeviceStatus.CRITICAL,
        zone: Zone.WAREHOUSE,
        lastSeen: now - 1000 * 10, // 10s ago
        firstSeen: now - 3600000 * 24 * 30, // 30 days ago
        signalStrength: -30,
        latitude: 35.6762, // Tokyo
        longitude: 139.6503,
        riskLevel: 'High',
        notes: 'Unusual traffic patterns detected'
      },
      {
        id: '5',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        ipAddress: '10.5.1.99',
        name: 'SG Logistics Pad',
        manufacturer: 'Samsung',
        type: 'Tablet',
        status: DeviceStatus.ONLINE,
        zone: Zone.WAREHOUSE,
        lastSeen: now,
        firstSeen: now - 3600000 * 1, // 1 hour ago
        signalStrength: -60,
        latitude: 1.3521, // Singapore
        longitude: 103.8198,
        riskLevel: 'Low',
        notes: 'Inventory management'
      }
    ];
  };

  const [devices, setDevices] = useState<Device[]>([]);
  const [aiReport, setAiReport] = useState<string>('Generating security assessment...');

  // Initialize devices on client side to avoid hydration mismatch with timestamps
  useEffect(() => {
    setDevices(getInitialDevices());
  }, []);

  useEffect(() => {
    if (!user || devices.length === 0) return; // Only run effects if logged in and initialized

    const fetchReport = async () => {
      const riskCount = devices.filter(d => d.riskLevel !== 'Low').length;
      try {
        const report = await generateSecurityReport(devices.length, riskCount);
        setAiReport(report);
      } catch (e) {
        setAiReport('System analysis unavailable.');
      }
    };
    
    // Initial fetch
    fetchReport();
    
    // Simulate signal fluctuation, slight GPS drift, and update timestamps
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        signalStrength: Math.max(-95, Math.min(-30, d.signalStrength + (Math.random() > 0.5 ? 2 : -2))),
        // Micro movement (approx 1-2 meters) to simulate live GPS jitter
        latitude: d.latitude + (Math.random() * 0.00002 - 0.00001),
        longitude: d.longitude + (Math.random() * 0.00002 - 0.00001),
        // Update lastSeen for Online devices to "now"
        lastSeen: d.status === DeviceStatus.ONLINE ? Date.now() : d.lastSeen
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddDevice = (device: Device) => {
    setDevices([...devices, device]);
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {activeTab === 'dashboard' && (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Security Overwatch</h2>
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-900/50 to-slate-800 rounded-lg border border-indigo-500/20">
                    <p className="text-indigo-200 text-sm font-mono flex items-start gap-3">
                        <span className="mt-1">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                        </span>
                        {aiReport}
                    </p>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                    <div className="text-slate-400 text-sm font-medium mb-2">Active Devices</div>
                    <div className="text-4xl font-bold text-white">{devices.length}</div>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                        Scanning complete
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                    <div className="text-slate-400 text-sm font-medium mb-2">High Risk Assets</div>
                    <div className="text-4xl font-bold text-white">
                        {devices.filter(d => d.riskLevel === 'High').length}
                    </div>
                     <div className="mt-2 text-xs text-rose-400 flex items-center">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mr-1"></span>
                        Action required
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                    <div className="text-slate-400 text-sm font-medium mb-2">Global Nodes</div>
                    <div className="text-4xl font-bold text-white">5<span className="text-lg text-slate-500 font-normal"> / 5 Zones</span></div>
                     <div className="mt-2 text-xs text-indigo-400 flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></span>
                        Optimal
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                     <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                        <h3 className="font-semibold text-white">Live Map Preview</h3>
                     </div>
                     <div className="flex-1 relative">
                        <TrackerMap devices={devices} onDeviceSelect={() => setActiveTab('devices')} />
                     </div>
                </div>
                
                 <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-auto">
                    <h3 className="font-semibold text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-4">
                        {devices.filter(d => d.riskLevel !== 'Low').length === 0 ? (
                             <p className="text-slate-500 text-sm italic">No alerts active.</p>
                        ) : (
                            devices.filter(d => d.riskLevel !== 'Low').map(d => (
                                <div key={d.id} className="flex items-start p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <div className={`mt-1 min-w-[8px] h-2 rounded-full mr-3 ${d.riskLevel === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{d.name} <span className="text-slate-500 text-xs">({d.macAddress})</span></div>
                                        <div className="text-xs text-slate-400 mt-1">Detected in {d.zone}. Potential security variance based on OUI analysis.</div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="flex items-start p-3 bg-slate-900/50 rounded-lg border border-slate-700 opacity-50">
                            <div className="mt-1 min-w-[8px] h-2 bg-emerald-500 rounded-full mr-3"></div>
                            <div>
                                <div className="text-sm font-medium text-white">System Start</div>
                                <div className="text-xs text-slate-400 mt-1">NetSentry initialized successfully. Global monitoring active.</div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      )}

      {activeTab === 'map' && (
        <TrackerMap devices={devices} onDeviceSelect={(d) => console.log(d)} />
      )}

      {activeTab === 'devices' && (
        <DeviceScanner 
          devices={devices} 
          onAddDevice={handleAddDevice} 
          onUpdateDevice={handleUpdateDevice}
        />
      )}
    </Layout>
  );
};

export default App;