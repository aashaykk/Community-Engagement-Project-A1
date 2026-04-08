import React from 'react';

export default function AuditTrail() {
  const logs = [
    { id: 101, action: 'CREATE_PROPOSAL', user: 'HOD Sharma', target: 'Room 301', timestamp: '2026-04-07 10:15 AM' },
    { id: 102, action: 'UPDATE_TARIFF', user: 'Admin System', target: 'Global Setting', timestamp: '2026-04-06 09:00 AM' },
    { id: 103, action: 'LOGIN_ATTEMPT', user: 'Student_12', target: 'Auth Service', timestamp: '2026-04-06 08:45 AM' },
  ];

  return (
    <div className="card">
      <h3 className="mb-3">System Audit Trail</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '0.75rem 0' }}>Action</th>
            <th>User</th>
            <th>Target</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem 0', fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{log.action}</td>
              <td>{log.user}</td>
              <td>{log.target}</td>
              <td className="text-muted">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
