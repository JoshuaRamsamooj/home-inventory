import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X } from 'lucide-react';

export default function LocationForm({ location, onClose }) {
    const { addLocation, updateLocation } = useInventory();
    const [formData, setFormData] = useState({
        name: '',
        type: 'bin',
        description: ''
    });

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name,
                type: location.type,
                description: location.description
            });
        }
    }, [location]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (location) {
            updateLocation(location.id, formData);
        } else {
            addLocation(formData);
        }
        onClose();
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

                <h2 className="text-lg font-semibold mb-4">{location ? 'Edit Location' : 'Add New Location'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Garage Shelf A"
                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="bin">Bin</option>
                            <option value="shelf">Shelf</option>
                            <option value="other">Other</option>
                        </select>
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

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            {location ? 'Save Changes' : 'Add Location'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
