import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function LocationFormModal({ initialData, onClose }) {
  const { addLocation, updateLocation } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    bins: [],
    shelves: []
  });
  const [newBin, setNewBin] = useState('');
  const [newShelf, setNewShelf] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        bins: initialData.bins || [],
        shelves: initialData.shelves || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      bins: formData.bins,
      shelves: formData.shelves
    };

    let success;
    if (initialData && initialData.id) {
      success = await updateLocation(initialData.id, data);
    } else {
      // For new locations, map objects back to strings if needed, 
      // OR update addLocation to handle objects. 
      // Current addLocation expects strings for bins/shelves? 
      // Let's check server... server POST expects strings.
      // We should normalize.
      // Actually, let's update POST to accept objects too or just map here.
      // For simplicity, let's map to strings for ADD, but objects for UPDATE.
      // Wait, consistent API is better.
      // Let's just send objects { name } for new ones.
      // Server POST needs update? 
      // Checking server POST... it iterates bins.forEach(binName => ...). It expects strings.
      // So for ADD, we map to strings.
      const payload = {
        ...data,
        bins: data.bins.map(b => b.name),
        shelves: data.shelves.map(s => s.name)
      };
      success = await addLocation(payload);
    }

    if (success) {
      onClose();
    }
  };

  const addBin = () => {
    if (newBin.trim()) {
      setFormData(prev => ({
        ...prev,
        bins: [...prev.bins, { name: newBin.trim() }] // Store as object
      }));
      setNewBin('');
    }
  };

  const removeBin = (index) => {
    setFormData(prev => ({ ...prev, bins: prev.bins.filter((_, i) => i !== index) }));
  };

  const addShelf = () => {
    if (newShelf.trim()) {
      setFormData(prev => ({
        ...prev,
        shelves: [...prev.shelves, { name: newShelf.trim() }] // Store as object
      }));
      setNewShelf('');
    }
  };

  const removeShelf = (index) => {
    setFormData(prev => ({ ...prev, shelves: prev.shelves.filter((_, i) => i !== index) }));
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

        <h2 className="text-lg font-semibold mb-4">{initialData ? 'Edit Location' : 'Add New Location'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Location Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Garage"
            />
          </div>

          {/* Bins Management */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Bins</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBin}
                onChange={e => setNewBin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBin())}
                className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add bin (e.g. Red Bin)"
              />
              <button
                type="button"
                onClick={addBin}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.bins.map((bin, index) => (
                <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm group">
                  <span>{bin.name}</span>
                  <button
                    type="button"
                    onClick={() => removeBin(index)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Shelves Management */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Shelves</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newShelf}
                onChange={e => setNewShelf(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addShelf())}
                className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add shelf (e.g. Top Shelf)"
              />
              <button
                type="button"
                onClick={addShelf}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.shelves.map((shelf, index) => (
                <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm group">
                  <span>{shelf.name}</span>
                  <button
                    type="button"
                    onClick={() => removeShelf(index)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              {initialData ? 'Save Changes' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
