function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>✅ Preview Test</h1>
        <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>Timepulse - Diagnostic System</p>
      </div>

      <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0 }}>System Status</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ React loaded and functional</li>
          <li>✅ JavaScript executing correctly</li>
          <li>✅ Inline styles applied</li>
          <li>✅ App.tsx component mounted</li>
        </ul>
      </div>

      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <h3 style={{ marginTop: 0 }}>Important Note</h3>
        <p style={{ margin: 0 }}>
          If you can see this page, the preview is working perfectly.
          The full application with all routes is ready to be reactivated.
        </p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Next Steps</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>Verify this test page displays correctly</li>
          <li>Check browser console for any errors (F12)</li>
          <li>Once confirmed working, restore full App.tsx code</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
