import React, { useState, useMemo } from 'react';
import { Plus, Filter, LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ItemCard from './ItemCard';
import InventoryTable from './InventoryTable';
import SearchBar from './SearchBar';
import ItemForm from './ItemForm';
import { formatLocation } from '../lib/utils';

export default function InventoryList() {
    const {
        items,
        locations,
        bins,
        shelves,
        pagination,
        filters,
        sorting,
        setPage,
        setLimit,
        setFilters,
        setSorting
    } = useInventory();

    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Debounce search update
    const handleSearchChange = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleLocationChange = (e) => {
        setFilters(prev => ({ ...prev, location_id: e.target.value }));
        setPage(1); // Reset to page 1 on filter change
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sorting.key === key && sorting.direction === 'asc') {
            direction = 'desc';
        }
        setSorting({ key, direction });
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

    const enrichedItems = items.map(enrichItem);

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
                                {sorting.key === 'name'
                                    ? (sorting.direction === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)')
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
                    <SearchBar value={filters.search} onChange={handleSearchChange} />
                </div>
                <div className="w-full sm:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            value={filters.location_id}
                            onChange={handleLocationChange}
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
                    sortConfig={sorting}
                    onSort={requestSort}
                />
            )}

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} items)
                    </div>
                    <select
                        value={pagination.limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-2 py-1 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-2 rounded-md border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-2 rounded-md border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
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
