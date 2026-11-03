interface SearchBoxProps {
  onSearch: (filterBy: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
    return (
        <div className="search-box">
            <input className="search-input" onChange={(e) => onSearch(e.target.value)} type="text" placeholder="Search by name" />
        </div>
    )
}