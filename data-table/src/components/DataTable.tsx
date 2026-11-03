import { useDeferredValue, useMemo, useState } from "react";
import type { User } from "../types/User";
import TableRow from "./TableRow";
import Paginatior from "./Paginator";
import SearchBox from "./SearchBox";
import "./DataTable.css";

interface DataTableProps {
  users: User[];
}

const totalUsersPerPage = 10;

export default function DataTable({ users }: DataTableProps) {
    const [sortProperty, setSortProperty] = useState<keyof User>("name");
    const [ascendingOrder, setAscendingOrder] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filterBy, setFilterBy] = useState<string>("");

    // Let React keep the input responsive while filtering catches up in the background
    const deferredFilterBy = useDeferredValue(filterBy);

    // Lowercase each name once per data change, not on every keystroke
    const searchIndex = useMemo(
        () => users.map((user) => ({ user, key: user.name.toLowerCase() })),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const query = deferredFilterBy.toLowerCase();
        if(query === ""){
            return users;
        }
        return searchIndex.filter((entry) => entry.key.includes(query)).map((entry) => entry.user);
    }, [users, searchIndex, deferredFilterBy]);

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
        <h2>Users</h2>
        <SearchBox onSearch={handleSearch}/>
        <table>
            <thead>
            <tr>
                <th className="sortable" onClick={() => handleClick("name")}>Name</th>
                <th className="sortable" onClick={() => handleClick("email")}>Email</th>
                <th className="sortable" onClick={() => handleClick("role")}>Role</th>
                <th className="sortable" onClick={() => handleClick("createdAt")}>Created At</th>
            </tr>
            </thead>

            <tbody>
            {pageUsers.map((user) => ( <TableRow key={user.id} user={user} />))}
            </tbody>
        </table>

        <Paginatior currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />        
        </div>
    );
}
