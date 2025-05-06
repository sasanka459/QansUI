// Welcome.js
import React from 'react';
import { useMsal } from '@azure/msal-react';

const Welcome = ({ user, provider }) => {
  const { instance } = useMsal();

  const handleLogout = () => {
    if (provider === 'azure') {
      instance.logoutRedirect();
    }
    // For Google, you'd need to implement Google logout
    window.location.reload(); // Clear local state
  };

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Welcome;