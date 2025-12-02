import React from 'react';
import { MapPin, Tag, Edit, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatLocation } from '../lib/utils';

export default function ItemCard({ item, onEdit }) {
    const { deleteItem, updateItem } = useInventory();

    const handleQuantityChange = (delta) => {
        const newQuantity = Math.max(0, item.quantity + delta);
        updateItem(item.id, { ...item, quantity: newQuantity });
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                                deleteItem(item.id);
                            }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>

            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{formatLocation(item)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-medium">Qty:</span>
                    <div className="flex items-center gap-1 ml-2">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        >
                            -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        >
                            +
                        </button>
                    </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                            <span key={tag.id || tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                <Tag className="w-3 h-3 mr-1" />
                                {typeof tag === 'object' ? tag.name : tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
