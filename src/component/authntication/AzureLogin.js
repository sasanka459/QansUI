import { useMsal } from '@azure/msal-react';

const AzureLogin = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["User.Read"]
    });
  };

  return <button onClick={handleLogin}>Login with Azure</button>;
};

export default AzureLogin;