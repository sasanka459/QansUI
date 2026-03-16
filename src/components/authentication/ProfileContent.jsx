import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from "@azure/msal-browser"; // Added this
import { loginRequest } from '../../services/authService';
import { callMsGraph } from '../../services/graphService';
import { ProfileData } from '../authentication/ProfileData';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; // Better UX

export const ProfileContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const [graphData, setGraphData] = useState(null);
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    // 1. Handle the "Loading" state more accurately
    if (inProgress !== InteractionStatus.None) {
        return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
    }

    // 2. Guard against empty accounts safely
    if (accounts.length === 0) {
        return <div>No active account found. Please sign in.</div>;
    }

    const requestProfileData = async () => {
        setIsLocalLoading(true);
        try {
            const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            });
            const data = await callMsGraph(response.accessToken);
            setGraphData(data);
        } catch (error) {
            console.error("Token acquisition failed, attempting popup...", error);
            // Fallback to popup if silent fails
            instance.acquireTokenPopup(loginRequest).then(response => {
                callMsGraph(response.accessToken).then(setGraphData);
            });
        } finally {
            setIsLocalLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h5 className="profileContent">Welcome, {accounts[0].name}</h5>

            {graphData ? (
                <ProfileData graphData={graphData} />
            ) : (
                <Button
                    variant="primary"
                    onClick={requestProfileData}
                    disabled={isLocalLoading}
                >
                    {isLocalLoading ? 'Fetching...' : 'View My Profile'}
                </Button>
            )}
        </div>
    );
};