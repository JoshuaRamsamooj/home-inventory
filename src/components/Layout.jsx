import React from 'react';
import { Package2, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming Link comes from react-router-dom

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6"> {/* Adjusted gap for better spacing */}
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
                {children}
            </main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                <p>&copy; 2024 Home Inventory Tracker</p>
            </footer>
        </div>
    );
}
