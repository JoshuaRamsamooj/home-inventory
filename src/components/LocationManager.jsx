import React, { useState } from 'react';
import { Plus, Package, Layers, MapPin } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import LocationFormModal from './LocationFormModal';
import MoveBinModal from './MoveBinModal';

export default function LocationManager() {
    const { locations, bins, shelves } = useInventory();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [binToMove, setBinToMove] = useState(null);

    const handleClose = () => {
        setIsModalOpen(false);
    };

    const getBinsForLocation = (locId) => bins.filter(b => b.location_id === locId);
    const getShelvesForLocation = (locId) => shelves.filter(s => s.location_id === locId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-2xl font-bold">Location Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(loc => (
                    <div key={loc.id} className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg">{loc.name}</h3>
                            <button
                                onClick={() => {
                                    setSelectedLocation({
                                        ...loc,
                                        bins: getBinsForLocation(loc.id),
                                        shelves: getShelvesForLocation(loc.id)
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="text-xs text-muted-foreground hover:text-primary underline"
                            >
                                Edit
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                                <div className="flex items-center mb-1 font-medium text-foreground">
                                    <Package className="w-4 h-4 mr-2" /> Bins ({getBinsForLocation(loc.id).length})
                                </div>
                                <div className="pl-6 flex flex-wrap gap-1">
                                    {getBinsForLocation(loc.id).map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBinToMove(b)}
                                            className="inline-block px-2 py-0.5 bg-secondary hover:bg-secondary/80 rounded text-xs transition-colors cursor-pointer"
                                            title="Click to move bin"
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                    {getBinsForLocation(loc.id).length === 0 && <span className="italic">None</span>}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <div className="flex items-center mb-1 font-medium text-foreground">
                                    <Layers className="w-4 h-4 mr-2" /> Shelves ({getShelvesForLocation(loc.id).length})
                                </div>
                                <div className="pl-6 flex flex-wrap gap-1">
                                    {getShelvesForLocation(loc.id).map(s => (
                                        <span key={s.id} className="inline-block px-2 py-0.5 bg-secondary rounded text-xs">
                                            {s.name}
                                        </span>
                                    ))}
                                    {getShelvesForLocation(loc.id).length === 0 && <span className="italic">None</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {locations.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No locations defined. Create one to get started.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <LocationFormModal
                    initialData={selectedLocation}
                    onClose={() => {
                        handleClose();
                        setSelectedLocation(null);
                    }}
                />
            )}

            {binToMove && (
                <MoveBinModal
                    bin={binToMove}
                    onClose={() => setBinToMove(null)}
                />
            )}
        </div>
    );
}
