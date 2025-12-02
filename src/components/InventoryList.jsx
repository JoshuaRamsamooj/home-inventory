import React, { useState, useMemo } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ItemCard from './ItemCard';
import SearchBar from './SearchBar';
import ItemForm from './ItemForm';
import { formatLocation } from '../lib/utils';

export default function InventoryList() {
    const { items, locations, bins, shelves } = useInventory();
    const [search, setSearch] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState('all');
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <ItemCard
                        key={item.id}
                        item={enrichItem(item)}
                        onEdit={handleEdit}
                        onDelete={() => { }} // Delete handled in card or context
                    />
                ))}
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No items found.
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ItemForm
                    item={editingItem}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
