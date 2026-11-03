import { useMemo, useState } from "react";
import type { User } from "../types/User";
import TableRow from "./TableRow";
import Paginatior from "./Paginator";
import SearchBox from "./SearchBox";
import "./DataTable.css";

interface DataTableProps {
  users: User[];
}

const totalUsersPerPage = 10;

const columns: { property: keyof User; label: string }[] = [
    { property: "name", label: "Name" },
    { property: "email", label: "Email" },
    { property: "role", label: "Role" },
    { property: "createdAt", label: "Created At" },
];

export default function DataTable({ users }: DataTableProps) {
    const [sortProperty, setSortProperty] = useState<keyof User>("name");
    const [ascendingOrder, setAscendingOrder] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filterBy, setFilterBy] = useState<string>("");

    // Lowercase each name once per data change, not on every keystroke
    const searchIndex = useMemo(
        () => users.map((user) => ({ user, key: user.name.toLowerCase() })),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const query = filterBy.toLowerCase();
        if(query === ""){
            return users;
        }
        return searchIndex.filter((entry) => entry.key.includes(query)).map((entry) => entry.user);
    }, [users, searchIndex, filterBy]);

    // Sort only when the data or sort settings change - currentPage is not a dependency
    const sortedUsers = useMemo(() => {
        const direction = ascendingOrder ? 1 : -1;
        return [...filteredUsers].sort((a, b) => {
            if (a[sortProperty] < b[sortProperty]) return -direction;
            if (a[sortProperty] > b[sortProperty]) return direction;
            return 0;
        });
    }, [filteredUsers, sortProperty, ascendingOrder]);

    const totalPages = Math.max(1, Math.ceil(sortedUsers.length / totalUsersPerPage));
    const page = Math.min(currentPage, totalPages);
    // Slicing 10 rows is cheap, no memo needed
    const pageUsers = sortedUsers.slice((page - 1) * totalUsersPerPage, page * totalUsersPerPage);

    function handleClick(property: keyof User) {
        if(property === sortProperty){
            setAscendingOrder(!ascendingOrder);
        }else{
            setAscendingOrder(true);
        }

        setSortProperty(property)
        setCurrentPage(1); // Reset to first page on new sort
    }

    function handleSearch(filterBy: string) {
        setFilterBy(filterBy);
        setCurrentPage(1); // Reset to first page on new search
    }
    
    return (
        <div className="table-container">
        <h2 id="users-heading">Users</h2>
        <SearchBox onSearch={handleSearch}/>
        <p className="visually-hidden" role="status">
            {sortedUsers.length.toLocaleString()} {sortedUsers.length === 1 ? "user" : "users"} found
        </p>
        <table aria-labelledby="users-heading">
            <thead>
            <tr>
                {columns.map(({ property, label }) => {
                    const isSorted = property === sortProperty;
                    return (
                        <th
                            key={property}
                            scope="col"
                            aria-sort={isSorted ? (ascendingOrder ? "ascending" : "descending") : "none"}
                        >
                            <button type="button" className="sort-button" onClick={() => handleClick(property)}>
                                {label}
                                <span className="sort-indicator" aria-hidden="true">
                                    {isSorted ? (ascendingOrder ? "▲" : "▼") : ""}
                                </span>
                            </button>
                        </th>
                    );
                })}
            </tr>
            </thead>

            <tbody>
            {pageUsers.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="empty-state">No users found</td>
                </tr>
            ) : (
                pageUsers.map((user) => ( <TableRow key={user.id} user={user} />))
            )}
            </tbody>
        </table>

        <Paginatior currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />        
        </div>
    );
}
