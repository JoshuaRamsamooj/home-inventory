import React, { useState, useMemo } from 'react';
import { Plus, Filter, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ItemCard from './ItemCard';
import InventoryTable from './InventoryTable';
import SearchBar from './SearchBar';
import ItemForm from './ItemForm';
import { formatLocation } from '../lib/utils';

export default function InventoryList() {
    const { items, locations, bins, shelves } = useInventory();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [selectedLocationId, setSelectedLocationId] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                (item.tags && item.tags.some(tag => {
                    const tagName = typeof tag === 'object' ? tag.name : tag;
                    return tagName.toLowerCase().includes(search.toLowerCase());
                }));

            const matchesLocation = selectedLocationId === 'all' || item.location_id == selectedLocationId;

            return matchesSearch && matchesLocation;
        });
    }, [items, search, selectedLocationId]);

    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredItems];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredItems, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    // Helper to enrich item with location names
    const enrichItem = (item) => {
        const loc = locations.find(l => l.id === item.location_id);
        const bin = bins.find(b => b.id === item.bin_id);
        const shelf = shelves.find(s => s.id === item.shelf_id);
        return {
            ...item,
            area: loc ? loc.name : 'Unknown', // Displaying location name as 'area' for backward compatibility in display
            bin: bin ? bin.name : null,
            shelf: shelf ? shelf.name : null
        };
    };

    const enrichedItems = sortedItems.map(enrichItem);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-secondary rounded-md p-1 border">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-1.5 rounded-sm transition-colors ${viewMode === 'card' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Card View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-sm transition-colors ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center bg-secondary rounded-md p-1 border">
                        <button
                            onClick={() => requestSort('name')}
                            className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            title="Sort by Name"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {sortConfig.key === 'name'
                                    ? (sortConfig.direction === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)')
                                    : 'Sort'}
                            </span>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchBar value={search} onChange={setSearch} />
                </div>
                <div className="w-full sm:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                            <option value="all">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrichedItems.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                        />
                    ))}
                    {enrichedItems.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No items found.
                        </div>
                    )}
                </div>
            ) : (
                <InventoryTable
                    items={enrichedItems}
                    onEdit={handleEdit}
                    sortConfig={sortConfig}
                    onSort={requestSort}
                />
            )}

            {isFormOpen && (
                <ItemForm
                    item={editingItem}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
