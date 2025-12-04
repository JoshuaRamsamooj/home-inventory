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
    const [error, setError] = useState(null);

    // Pagination, Sorting, Filtering State
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        location_id: 'all'
    });
    const [sorting, setSorting] = useState({
        key: 'name',
        direction: 'asc'
    });

    const clearError = () => setError(null);

    // Initial load of static data
    useEffect(() => {
        Promise.all([
            fetchLocations(),
            fetchBins(),
            fetchShelves(),
            fetchTags()
        ]).catch(e => setError(e.message));
    }, []);

    // Fetch items whenever params change
    useEffect(() => {
        fetchItems();
    }, [pagination.page, pagination.limit, filters, sorting]);

    const setPage = (page) => setPagination(prev => ({ ...prev, page }));
    const setLimit = (limit) => setPagination(prev => ({ ...prev, limit, page: 1 })); // Reset to page 1 on limit change

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setTags(data.data);
            } catch (e) {
                setError(`Error parsing tags: ${e.message}`);
            }
        } catch (e) { setError(e.message); }
    };

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/locations');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) setLocations(data.data);
            } catch (e) {
                setError(`Error parsing locations: ${e.message}`);
            }
        } catch (e) { setError(e.message); }
    };

    const fetchBins = async () => {
        try {
            const res = await fetch('/api/bins');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) {
                    setBins(data.data.sort((a, b) => a.name.localeCompare(b.name)));
                }
            } catch (e) {
                setError(`Error parsing bins: ${e.message}`);
            }
        } catch (e) { setError(e.message); }
    };

    const fetchShelves = async () => {
        try {
            const res = await fetch('/api/shelves');
            const text = await res.text();
            try {
                const data = text ? JSON.parse(text) : { data: [] };
                if (data.data) {
                    setShelves(data.data.sort((a, b) => a.name.localeCompare(b.name)));
                }
            } catch (e) {
                setError(`Error parsing shelves: ${e.message}`);
            }
        } catch (e) { setError(e.message); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                sort: sorting.key,
                order: sorting.direction,
                search: filters.search,
                location_id: filters.location_id
            });

            const response = await fetch(`/api/items?${queryParams}`);
            const text = await response.text();
            try {
                const data = text ? JSON.parse(text) : { data: [], meta: {} };
                if (data.data) {
                    setItems(data.data);
                    if (data.meta) {
                        setPagination(prev => ({
                            ...prev,
                            total: data.meta.total,
                            totalPages: data.meta.totalPages
                        }));
                    }
                } else if (data.error) {
                    setError(`Server error fetching items: ${data.error}`);
                }
            } catch (e) {
                setError(`Error parsing items response: ${e.message}`);
            }
        } catch (error) {
            setError(`Error fetching items: ${error.message}`);
        } finally {
            setLoading(false);
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
                fetchItems(); // Refresh list
                fetchTags();
            }
        } catch (error) {
            setError(`Error adding item: ${error.message}`);
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
                fetchItems(); // Refresh list
                fetchTags();
            }
        } catch (error) {
            setError(`Error updating item: ${error.message}`);
        }
    };

    const deleteItem = async (id) => {
        try {
            const response = await fetch(`/api/items/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchItems(); // Refresh list
            }
        } catch (error) {
            setError(`Error deleting item: ${error.message}`);
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
            let json;
            try {
                json = text ? JSON.parse(text) : {};
            } catch (e) {
                setError(`Failed to parse JSON: ${text}`);
                throw e;
            }

            if (res.ok) {
                setLocations(prev => [...prev, json.data]);
                fetchBins();
                fetchShelves();
                return true;
            } else {
                setError(`Server error: ${JSON.stringify(json)}`);
                return false;
            }

        } catch (e) { setError(e.message); return false; }
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
            setError(`Error updating location: ${e.message}`);
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
        } catch (e) { setError(e.message); return false; }
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
        } catch (e) { setError(e.message); return false; }
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
        } catch (e) { setError(e.message); return false; }
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
        } catch (e) { setError(e.message); return false; }
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
            loading,
            error,
            clearError,
            // Pagination & Sorting
            pagination,
            filters,
            sorting,
            setPage,
            setLimit,
            setFilters,
            setSorting
        }}>
            {children}
        </InventoryContext.Provider>
    );
}
