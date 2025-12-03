import { Edit, Trash2, Tag, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatLocation } from '../lib/utils';

export default function InventoryTable({ items, onEdit, sortConfig, onSort }) {
    const { deleteItem, updateItem } = useInventory();

    const handleQuantityChange = (item, delta) => {
        const newQuantity = Math.max(0, item.quantity + delta);
        updateItem(item.id, { ...item, quantity: newQuantity });
    };



    const getSortIcon = (name) => {
        if (sortConfig.key !== name) {
            return <ArrowUpDown className="w-4 h-4 ml-1 text-muted-foreground/50" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-4 h-4 ml-1 text-primary" />;
        }
        return <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
    };

    return (
        <div className="rounded-md border">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                        <th
                            className="p-4 cursor-pointer hover:bg-muted/80 transition-colors select-none group"
                            onClick={() => onSort('name')}
                        >
                            <div className="flex items-center">
                                Name
                                {getSortIcon('name')}
                            </div>
                        </th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Tags</th>
                        <th className="p-4">Quantity</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {items.map(item => (
                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-medium">{item.name}</td>
                            <td className="p-4 text-muted-foreground max-w-xs truncate" title={item.description}>
                                {item.description}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    <span>{formatLocation(item)}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {item.tags && item.tags.map(tag => (
                                        <span key={tag.id || tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {typeof tag === 'object' ? tag.name : tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(item, -1)}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item, 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-primary transition-colors"
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
                                        className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                No items found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
