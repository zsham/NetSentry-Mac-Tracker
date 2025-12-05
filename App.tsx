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
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      macAddress: 'A4:C3:F0:89:12:34',
      ipAddress: '192.168.1.105',
      name: 'Executive Laptop',
      manufacturer: 'Apple, Inc.',
      type: 'MacBook Pro',
      status: DeviceStatus.ONLINE,
      zone: Zone.OFFICE_NORTH,
      lastSeen: 'Now',
      signalStrength: -45,
      coordinates: { x: 55, y: 25 },
      riskLevel: 'Low',
      notes: 'Corporate asset'
    },
    {
      id: '2',
      macAddress: '00:1B:44:11:3A:B7',
      ipAddress: '192.168.1.200',
      name: 'Unknown IoT',
      manufacturer: 'Espressif Inc.',
      type: 'Smart Plug / Sensor',
      status: DeviceStatus.WARNING,
      zone: Zone.LOBBY,
      lastSeen: '5m ago',
      signalStrength: -72,
      coordinates: { x: 15, y: 65 },
      riskLevel: 'Medium',
      notes: 'Unauthorized device detected'
    }
  ]);

  const [aiReport, setAiReport] = useState<string>('Generating security assessment...');

  useEffect(() => {
    if (!user) return; // Only run effects if logged in

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
    
    // Simulate signal fluctuation and movement
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        signalStrength: Math.max(-95, Math.min(-30, d.signalStrength + (Math.random() > 0.5 ? 2 : -2))),
        // Slight coordinate jitter to simulate GPS drift/movement
        coordinates: {
            x: Math.max(5, Math.min(95, d.coordinates.x + (Math.random() - 0.5))),
            y: Math.max(5, Math.min(95, d.coordinates.y + (Math.random() - 0.5)))
        }
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
                    <div className="text-slate-400 text-sm font-medium mb-2">Network Load</div>
                    <div className="text-4xl font-bold text-white">12<span className="text-lg text-slate-500 font-normal">Mbps</span></div>
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
                                <div className="text-xs text-slate-400 mt-1">NetSentry initialized successfully.</div>
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
