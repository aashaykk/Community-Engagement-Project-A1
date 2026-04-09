import React, { useState, useEffect } from 'react';
import api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SimulationSandbox() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [capacity, setCapacity] = useState(5);
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proposalStatus, setProposalStatus] = useState('');

  useEffect(() => {
    // Mock token for dev if needed or use real auth
    api.get('/rooms').then(res => {
      setRooms(res.data);
      if (res.data.length > 0) setSelectedRoom(res.data[0]._id);
    }).catch(err => console.error("Error fetching rooms", err));
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    setLoading(true);
    // Real implementation would pass month/year dynamically, hardcoding April 2026 for demo map
    api.get(`/solar/payback/${selectedRoom}?month=4&year=2026&panelCapacityKW=${capacity}`)
      .then(res => {
        setSimulationData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Simulation error", err);
        setLoading(false);
        setSimulationData(null); // Clear data on error to show empty state
      });
  }, [selectedRoom, capacity]);

  const submitProposal = async () => {
    if (!selectedRoom || !simulationData) return;
    try {
      setProposalStatus('submitting');
      await api.post('/proposals', {
        roomId: selectedRoom,
        description: `Install ${capacity} kW Solar Panel array. Expected ROI in ${simulationData.paybackYears} years.`,
        diff: {
          prev: { installedSolarKW: 0 },
          next: { installedSolarKW: capacity }
        }
      });
      setProposalStatus('success');
      setTimeout(() => setProposalStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setProposalStatus('error');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="mb-4">Renewable Sandbox Simulator</h2>
      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Controls */}
        <div className="card">
          <h3 className="mb-4">Simulation Parameters</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Room/Facility</label>
            <select 
              value={selectedRoom} 
              onChange={e => setSelectedRoom(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff' }}
            >
              <option value="" disabled>Select Room</option>
              {rooms.map(r => (
                <option key={r._id} value={r._id}>{r.name} {r.code ? `(${r.code})` : ''}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Solar Panel Capacity: <span className="text-gradient" style={{ fontWeight: 'bold' }}>{capacity} kW</span>
            </label>
            <input 
              type="range" 
              min="1" max="50" step="1" 
              value={capacity} 
              onChange={e => setCapacity(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>1 kW</span>
              <span>50 kW</span>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', background: 'var(--brand-primary)', color: '#000', fontWeight: 'bold' }}
            onClick={submitProposal}
            disabled={proposalStatus === 'submitting' || loading || !simulationData}
          >
            {proposalStatus === 'submitting' ? 'Submitting...' : 
             proposalStatus === 'success' ? '✔ Proposal Sent' : 
             'Submit Sandbox Proposal'}
          </button>
          {proposalStatus === 'error' && <p className="text-danger mt-2 text-sm text-center">Failed to submit proposal</p>}

        </div>

        {/* Results Screen */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4">Feasibility & Payback Analysis</h3>
          
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-muted animate-pulse">Running simulation models...</p>
            </div>
          ) : simulationData ? (
            <>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-muted text-sm mb-1">Initial Investment</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{simulationData.panelCostINR.toLocaleString()}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-success text-sm mb-1">Annual Savings</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-success)' }}>₹{simulationData.annualSavingINR.toLocaleString()}</p>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-warning text-sm mb-1">Payback Period</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>{simulationData.paybackYears} Years</p>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData.paybackTimeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" label={{ value: 'Years', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.5)', offset: -5 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={val => '₹' + (val/1000).toFixed(0) + 'k'} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                      formatter={(value) => '₹' + value.toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="investment" name="Total Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cumulativeSaving" name="Cumulative Grid Savings" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <p className="text-muted">Select a room to begin simulation. If no rooms are available, please ensure your department has recorded rooms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
