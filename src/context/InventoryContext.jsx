import { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../lib/utils';

const InventoryContext = createContext();

export function useInventory() {
    return useContext(InventoryContext);
}

export function InventoryProvider({ children }) {
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [bins, setBins] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchItems(),
            fetchLocations(),
            fetchBins(),
            fetchShelves(),
            fetchTags()
        ]).finally(() => setLoading(false));
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setTags(data.data);
            } catch (e) {
                console.error('Error parsing tags:', text);
            }
        } catch (e) { console.error(e); }
    };

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/locations');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setLocations(data.data);
            } catch (e) {
                console.error('Error parsing locations:', text);
            }
        } catch (e) { console.error(e); }
    };

    const fetchBins = async () => {
        try {
            const res = await fetch('/api/bins');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setBins(data.data);
            } catch (e) {
                console.error('Error parsing bins:', text);
            }
        } catch (e) { console.error(e); }
    };

    const fetchShelves = async () => {
        try {
            const res = await fetch('/api/shelves');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setShelves(data.data);
            } catch (e) {
                console.error('Error parsing shelves:', text);
            }
        } catch (e) { console.error(e); }
    };

    const fetchItems = async () => {
        try {
            const response = await fetch('/api/items');
            const text = await response.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) {
                    setItems(data.data);
                } else if (data.error) {
                    console.error('Server error fetching items:', data.error);
                }
            } catch (e) {
                console.error('Error parsing items response:', text);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const addItem = async (item) => {
        const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString() };
        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            if (response.ok) {
                setItems(prev => [...prev, newItem]);
                fetchTags();
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const updateItem = async (id, updates) => {
        try {
            const response = await fetch(`/api/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
                fetchTags();
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const deleteItem = async (id) => {
        try {
            const response = await fetch(`/api/items/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // --- CRUD for Locations, Bins, Shelves ---

    const addLocation = async (data) => {
        try {
            const res = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const text = await res.text();
            console.log(`AddLocation Response: Status ${res.status}, Body: "${text}"`);

            let json;
            try {
                json = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse JSON:', text);
                throw e;
            }

            if (res.ok) {
                setLocations(prev => [...prev, json.data]);
                fetchBins();
                fetchShelves();
                return true;
            } else {
                console.error('Server error:', json);
                return false;
            }

        } catch (e) { console.error(e); return false; }
    };

    const updateLocation = async (id, data) => {
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // Refresh all data to ensure sync
                fetchLocations();
                fetchBins();
                fetchShelves();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error updating location:', e);
            return false;
        }
    };

    const addBin = async (data) => {
        try {
            const res = await fetch('/api/bins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (res.ok) {
                setBins(prev => [...prev, json.data]);
                return true;
            }
        } catch (e) { console.error(e); return false; }
    };

    const addShelf = async (data) => {
        try {
            const res = await fetch('/api/shelves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (res.ok) {
                setShelves(prev => [...prev, json.data]);
                return true;
            }
        } catch (e) { console.error(e); return false; }
    };

    const updateBin = async (id, data) => {
        try {
            const res = await fetch(`/api/bins/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (res.ok) {
                setBins(prev => prev.map(b => b.id === id ? json.data : b));
                return true;
            }
        } catch (e) { console.error(e); return false; }
    };

    const updateShelf = async (id, data) => {
        try {
            const res = await fetch(`/api/shelves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (res.ok) {
                setShelves(prev => prev.map(s => s.id === id ? json.data : s));
                return true;
            }
        } catch (e) { console.error(e); return false; }
    };

    return (
        <InventoryContext.Provider value={{
            items,
            locations,
            bins,
            shelves,
            tags,
            addItem,
            updateItem,
            deleteItem,
            addLocation,
            updateLocation,
            addBin,
            addShelf,
            updateBin,
            updateShelf,
            loading
        }}>
            {children}
        </InventoryContext.Provider>
    );
}
