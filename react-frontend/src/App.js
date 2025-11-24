import { useState, useEffect } from 'react';
import sdk from './sdk';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user context
    try {
      const currentUserId = sdk.getUserId();
      setUserId(currentUserId);
      console.log('Current user:', currentUserId);

      // Fetch data using SDK
      if (currentUserId) {
        sdk.getFirebaseData('Users', currentUserId)
          .then((userData) => {
            setData(userData);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching data:', err);
            setError(err.message);
            setLoading(false);
          });
      } else {
        setError('No user ID found. In local mode, the SDK should automatically provide a default user ID.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error getting user ID:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const handleCreate = async () => {
    try {
      const result = await sdk.createFirebaseData('Chats', `chat_${Date.now()}`, {
        message: 'Hello from micro module!',
        created_at: new Date().toISOString(),
        user_id: userId,
      });
      console.log('Created:', result);
      alert('Data created successfully! Check console for details.');
    } catch (err) {
      console.error('Error creating:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="container">
          <h1>Error</h1>
          <p>{error}</p>
          <p className="hint">
            Make sure you've set up your Firebase configuration in the environment file.
            In local mode (apiBaseUrl: undefined), authentication context is automatically provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>My FN7 Micro Module</h1>
        <p className="subtitle">User ID: {userId || 'Not available'}</p>

        <div className="section">
          <h2>User Data</h2>
          <pre className="data-display">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="section">
          <h2>Actions</h2>
          <button onClick={handleCreate} className="btn-primary">
            Create Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

