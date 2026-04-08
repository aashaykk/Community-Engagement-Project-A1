import React from 'react';

export default function NotificationCenter() {
  const notifications = [
    { id: 1, title: 'Consumption Alert', desc: 'Library wing exceeded daily threshold by 15%', type: 'warning', time: '10 mins ago' },
    { id: 2, title: 'Proposal Approved', desc: 'PR-101 for Solar Installation Phase 1 approved by Admin', type: 'success', time: '2 hours ago' },
    { id: 3, title: 'System Maintenance', desc: 'Scheduled downtime on Sunday 2AM-4AM', type: 'info', time: '1 day ago' },
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'warning': return 'var(--status-warning)';
      case 'success': return 'var(--status-success)';
      case 'info': return 'var(--status-info)';
      case 'danger': return 'var(--status-danger)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
         <h3>Notification Center</h3>
         <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Mark all read</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(notif => (
          <div key={notif.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${getTypeColor(notif.type)}` }}>
            <div className="flex justify-between items-center mb-1">
              <h4 style={{ fontSize: '1rem' }}>{notif.title}</h4>
              <span className="text-muted text-sm" style={{ fontSize: '0.75rem' }}>{notif.time}</span>
            </div>
            <p className="text-secondary text-sm">{notif.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
