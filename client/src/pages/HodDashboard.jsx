export default function HodDashboard() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2>Department Controls</h2>
        <button className="btn btn-primary">New Proposal</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Dept Consumption</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>3.2 MWh</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Solar Potential Score</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>85/100</p>
          <p className="text-success text-sm">High feasibility</p>
        </div>
      </div>

      <div className="card mb-4">
         <h3 className="mb-2">Rooms List</h3>
         <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0' }}>Room</th>
                <th>Type</th>
                <th>Appliances</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem 0' }}>Lab 301</td>
                <td>Computer Lab</td>
                <td>42 items</td>
                <td><button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>Manage</button></td>
              </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}
