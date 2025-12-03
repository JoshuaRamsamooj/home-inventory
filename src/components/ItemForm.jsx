
import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X } from 'lucide-react';
import TagInput from './TagInput';

export default function ItemForm({ item, onClose }) {
    const { addItem, updateItem, locations, bins, shelves, tags } = useInventory();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: 1,
        location_id: '',
        bin_id: '',
        shelf_id: '',
        tags: [] // Now an array of strings
    });
    const [showSuccess, setShowSuccess] = useState(false);

    // Set default location
    useEffect(() => {
        if (locations.length > 0 && !formData.location_id) {
            setFormData(prev => ({ ...prev, location_id: locations[0].id }));
        }
    }, [locations]);

    // Filter bins and shelves by selected location
    const availableBins = bins.filter(b => b.location_id == formData.location_id);
    const availableShelves = shelves.filter(s => s.location_id == formData.location_id);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                location_id: item.location_id || (locations.length > 0 ? locations[0].id : ''),
                bin_id: item.bin_id || '',
                shelf_id: item.shelf_id || '',
                tags: item.tags ? item.tags.map(t => typeof t === 'object' ? t.name : t) : []
            });
        }
    }, [item]);

    const handleSubmit = async (e, shouldClose = true) => {
        e.preventDefault();
        const data = {
            ...formData,
            location_id: parseInt(formData.location_id),
            bin_id: formData.bin_id ? parseInt(formData.bin_id) : null,
            shelf_id: formData.shelf_id ? parseInt(formData.shelf_id) : null,
            tags: formData.tags // Already an array of strings
        };

        if (item) {
            await updateItem(item.id, data);
        } else {
            await addItem(data);
        }

        if (shouldClose) {
            onClose();
        } else {
            // Reset form but keep location data
            setFormData(prev => ({
                ...prev,
                name: '',
                description: '',
                quantity: 1,
                tags: []
            }));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-lg font-semibold mb-4">{item ? 'Edit Item' : 'Add New Item'}</h2>

                {showSuccess && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-sm text-center animate-in fade-in slide-in-from-top-1">
                        Item added successfully!
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <select
                                value={formData.location_id}
                                onChange={e => setFormData({ ...formData, location_id: e.target.value, bin_id: '', shelf_id: '' })}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bin</label>
                            <select
                                value={formData.bin_id}
                                onChange={e => setFormData({ ...formData, bin_id: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">None</option>
                                {availableBins.map(bin => (
                                    <option key={bin.id} value={bin.id}>{bin.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Shelf</label>
                            <select
                                value={formData.shelf_id}
                                onChange={e => setFormData({ ...formData, shelf_id: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">None</option>
                                {availableShelves.map(shelf => (
                                    <option key={shelf.id} value={shelf.id}>{shelf.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <TagInput
                        selectedTags={formData.tags}
                        onTagsChange={newTags => setFormData({ ...formData, tags: newTags })}
                        existingTags={tags}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                        >
                            {item ? 'Save Changes' : 'Add Item'}
                        </button>
                        {!item && (
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, false)}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-medium transition-colors border border-input"
                            >
                                Save & Add Another
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

