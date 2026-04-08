export default function StudentDashboard() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2>Campus Energy Public Dashboard</h2>
      </div>

      <div className="card mb-4">
         <div className="text-center mb-4">
            <h3 className="text-secondary">Current Solar Savings</h3>
            <p className="text-gradient" style={{ fontSize: '3rem', fontWeight: 'bold' }}>12.5%</p>
            <p className="text-muted text-sm">Of total campus energy is running on renewables</p>
         </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card text-center">
           <h3 className="text-secondary mb-2">Download Analytics Report</h3>
           <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>Access full detailed historical consumption data formatted in CSV</p>
           <button className="btn btn-secondary w-full">Download CSV</button>
        </div>
        <div className="card text-center">
           <h3 className="text-secondary mb-2">Simulation Sandbox</h3>
           <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>Model potential savings if more rooms added solar</p>
           <button className="btn btn-secondary w-full">Open Sandbox</button>
        </div>
      </div>
    </div>
  );
}
