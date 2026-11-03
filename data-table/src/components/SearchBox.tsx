import { useEffect, useRef } from "react";

interface SearchBoxProps {
  onSearch: (filterBy: string) => void;
  delay?: number;
}

export default function SearchBox({ onSearch, delay = 300 }: SearchBoxProps) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Don't fire a pending search after the component unmounts
    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    // Restart the timer on every keystroke, so onSearch only runs once typing stops
    function handleChange(value: string) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onSearch(value), delay);
    }

    return (
        <div className="search-box">
            <label htmlFor="user-search" className="visually-hidden">Search users by name</label>
            <input id="user-search" className="search-input" onChange={(e) => handleChange(e.target.value)} type="search" placeholder="Search by name" />
        </div>
    )
}
