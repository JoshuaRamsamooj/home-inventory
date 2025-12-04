import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function MoveBinModal({ bin, onClose }) {
    const { locations, updateBin } = useInventory();
    const [targetLocationId, setTargetLocationId] = useState('');
    const [error, setError] = useState('');

    const availableLocations = locations.filter(l => l.id !== bin.location_id);

    const handleMove = async () => {
        if (!targetLocationId) {
            setError('Please select a location.');
            return;
        }

        const success = await updateBin(bin.id, {
            name: bin.name,
            location_id: parseInt(targetLocationId)
        });

        if (success) {
            onClose();
        } else {
            setError('Failed to move bin.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-lg font-semibold mb-4">Move Bin: {bin.name}</h2>

                {error && (
                    <div className="mb-4 p-2 bg-destructive/10 text-destructive rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Move to Location</label>
                        <select
                            value={targetLocationId}
                            onChange={(e) => {
                                setTargetLocationId(e.target.value);
                                setError('');
                            }}
                            className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a location...</option>
                            {availableLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={!targetLocationId}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Move
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
