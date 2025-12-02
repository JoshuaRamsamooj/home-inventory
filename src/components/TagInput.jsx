import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

export default function TagInput({ selectedTags = [], onTagsChange, existingTags = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Filter suggestions based on input
    const suggestions = existingTags.filter(tag =>
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag.name)
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tagName) => {
        if (tagName.trim() && !selectedTags.includes(tagName.trim())) {
            onTagsChange([...selectedTags, tagName.trim()]);
            setInputValue('');
            setIsOpen(false);
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div
                className="min-h-[38px] w-full px-2 py-1.5 rounded-md border bg-background text-sm flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent cursor-text"
                onClick={() => document.getElementById('tag-input').focus()}
            >
                {selectedTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    id="tag-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none min-w-[60px] placeholder:text-muted-foreground"
                    placeholder={selectedTags.length === 0 ? "Select or create tags..." : ""}
                />
            </div>

            {isOpen && (inputValue || suggestions.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-60 overflow-auto py-1">
                    {suggestions.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag.name)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                        >
                            <span>{tag.name}</span>
                        </button>
                    ))}

                    {inputValue && !suggestions.find(s => s.name.toLowerCase() === inputValue.toLowerCase()) && !selectedTags.includes(inputValue) && (
                        <button
                            type="button"
                            onClick={() => addTag(inputValue)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center text-primary"
                        >
                            <Plus className="w-3 h-3 mr-2" />
                            Create "{inputValue}"
                        </button>
                    )}

                    {suggestions.length === 0 && !inputValue && (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            No matching tags found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
