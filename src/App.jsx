import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InventoryList from './components/InventoryList';
import LocationManager from './components/LocationManager';
import { InventoryProvider } from './context/InventoryContext';

export default function App() {
    return (
        <Router>
            <InventoryProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<InventoryList />} />
                        <Route path="/locations" element={<LocationManager />} />
                    </Routes>
                </Layout>
            </InventoryProvider>
        </Router>
    );
}
