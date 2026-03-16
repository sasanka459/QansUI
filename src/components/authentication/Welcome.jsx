import React from 'react';
import { useMsal } from '@azure/msal-react';

const Welcome = ({ user, provider }) => {
  const { instance } = useMsal();

  // --- THE FIX ---
  // If user is undefined or null, stop here and render nothing.
  // This prevents the "Cannot read properties of undefined (reading 'name')" error.
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (provider === 'azure') {
      instance.logoutRedirect();
    } else {
      // Logic for other providers or local cleanup
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="welcome-card">
      {/* Now it is 100% safe to access user.name */}
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email || user.username}</p>
      <button
        className="btn btn-outline-danger"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Welcome;