import React from 'react';
import { Package2, MapPin, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';

export default function Layout({ children }) {
    const { error, clearError } = useInventory();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Package2 className="w-6 h-6" />
                            <span>HomeInventory</span>
                        </Link>
                        <nav className="flex items-center gap-4">
                            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Inventory</Link>
                            <Link to="/locations" className="text-sm font-medium hover:text-primary transition-colors">Locations</Link>
                        </nav>
                    </div>

                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-medium">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-destructive/70 hover:text-destructive transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {children}
            </main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                <p>&copy; 2024 Home Inventory Tracker</p>
            </footer>
        </div>
    );
}
