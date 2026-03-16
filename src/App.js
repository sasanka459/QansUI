import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { UIProvider } from './context/UIContext'; // If using Method 1
import { Router } from './routes/Router';
import './App.css';

export default function App() {
    return (
        <UIProvider>
            <BrowserRouter>
                <Router />
            </BrowserRouter>
        </UIProvider>
    );
}