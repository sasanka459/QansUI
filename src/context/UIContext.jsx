import React, { createContext, useContext, useState, useMemo } from 'react';

// 1. Create the Context object
const UIContext = createContext();

// 2. Create the Provider component
export const UIProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Define your "actions"
    const isBusy = () => setIsLoading(true);
    const isIdle = () => setIsLoading(false);

    // Memoize the value to prevent unnecessary re-renders of the provider
    const value = useMemo(() => ({
        isLoading,
        isBusy,
        isIdle
    }), [isLoading]);

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

// 3. Create a Custom Hook for easy access
export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};