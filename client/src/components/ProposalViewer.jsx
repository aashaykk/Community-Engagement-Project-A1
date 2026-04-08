import React from 'react';

export default function ProposalViewer() {
  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3>Proposal #PR-102: Upgrade Lab 301 ACs</h3>
        <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--status-warning)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem' }}>Pending HOD</span>
      </div>
      
      <p className="text-muted mb-4">Proposed by: Prof. Sharma • Submitted 2 hours ago</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, border: '1px solid var(--status-danger)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h4 className="text-danger mb-2" style={{ color: 'var(--status-danger)' }}>Old Configuration (Current)</h4>
          <pre style={{ margin: 0, color: '#ef4444' }}>
            {`- 5x LG 1.5T Non-Inverter AC (1900W)\n- Estimated Monthly: 1425 kWh\n- Energy Rating: 3 Star`}
          </pre>
        </div>
        <div style={{ flex: 1, border: '1px solid var(--status-success)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h4 className="text-success mb-2" style={{ color: 'var(--status-success)' }}>New Configuration (Proposed)</h4>
          <pre style={{ margin: 0, color: '#10b981' }}>
            {`+ 5x Daikin 1.5T Inverter AC (1200W)\n+ Estimated Monthly: 900 kWh\n+ Energy Rating: 5 Star`}
          </pre>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary" style={{ background: 'var(--status-success)', color: '#000' }}>Approve</button>
        <button className="btn btn-secondary text-danger">Reject</button>
        <button className="btn btn-secondary">Request Changes</button>
      </div>
    </div>
  );
}
