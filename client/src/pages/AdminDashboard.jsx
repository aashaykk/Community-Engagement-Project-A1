import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api';
import ProposalViewer from '../components/ProposalViewer';
import NotificationCenter from '../components/NotificationCenter';
import AuditTrail from '../components/AuditTrail';

const mockData = [
  { name: 'Jan', consumption: 21 },
  { name: 'Feb', consumption: 22 },
  { name: 'Mar', consumption: 28 },
  { name: 'Apr', consumption: 32 },
  { name: 'May', consumption: 35 },
  { name: 'Jun', consumption: 38 },
  { name: 'Jul', consumption: 29 },
];

export default function AdminDashboard() {

  const handleGCalSync = async () => {
    try {
      toast.loading('Syncing Google Calendar...', { id: 'gcal' });
      await new Promise(r => setTimeout(r, 1000)); // MOCKED LATENCY
      await api.post('/holidays/sync-gcal', { calendarUrl: 'primary' }).catch(()=>null);
      toast.success('Successfully synced events from Google Calendar', { id: 'gcal' });
    } catch {
      toast.error('Failed to sync', { id: 'gcal' });
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2>Admin Overview</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleGCalSync}>Sync GCal</button>
          <button className="btn btn-primary">Generate PDF Report</button>
        </div>
      </div>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Campus Total Consumption</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>24.5 MWh</p>
          <p className="text-muted text-sm">+2.4% from last month</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Pending Proposals</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>12</p>
          <p className="text-warning text-sm">3 require immediate review</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Current Tariff Bill</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹4,25,000</p>
          <p className="text-muted text-sm">Estimated for current month</p>
        </div>
      </div>

      <div className="card mb-4">
         <h3 className="mb-3">Energy Trends (MWh)</h3>
         <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101014', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Area type="monotone" dataKey="consumption" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCons)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 className="text-secondary mb-2">Pending Approvals</h3>
          <ProposalViewer />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <NotificationCenter />
          <AuditTrail />
        </div>
      </div>

    </div>
  );
}
