function RevisionHistory({ history, onRestore, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          margin: '50px auto',
          padding: '20px',
          backgroundColor: '#fff',
          maxWidth: '600px',
          borderRadius: '8px',
        }}
      >
        <h2>Revision History</h2>
        <button onClick={onClose}>Close</button>
        <ul>
          {history.map((entry, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
              <button onClick={() => onRestore(entry)}>Restore</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RevisionHistory;