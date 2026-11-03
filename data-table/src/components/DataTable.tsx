import { useMemo, useState } from "react";
import type { User } from "../types/User";
import TableRow from "./TableRow";
import Paginatior from "./Paginator";
import SearchBox from "./SearchBox";
import "./DataTable.css";

interface DataTableProps {
  users: User[];
}

export default function DataTable({ users }: DataTableProps) {
    const [sortProperty, setSortProperty] = useState<keyof User>("name");
    const [ascendingOrder, setAscendingOrder] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filterBy, setFilterBy] = useState<string>("");
    const totalUsersPerPage = 3;

    const filteredUsers = useMemo(() => {
        if(filterBy === ""){
            return users;
        }

        return users.filter((user) => user.name.toLowerCase().includes(filterBy.toLowerCase()));
    }, [users, filterBy]);
    
    const totalPages = Math.ceil(filteredUsers.length / totalUsersPerPage); // Assuming 10 users per page
    const sortedUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            if(ascendingOrder){
                if (a[sortProperty] < b[sortProperty]) return -1;
                if (a[sortProperty] > b[sortProperty]) return 1;
                return 0;
            } else {
                if (a[sortProperty] > b[sortProperty]) return -1;
                if (a[sortProperty] < b[sortProperty]) return 1;
                return 0;
            }
        }).slice((currentPage - 1) * totalUsersPerPage, Math.min(currentPage * totalUsersPerPage, filteredUsers.length));
    }, [filteredUsers, sortProperty, ascendingOrder, currentPage]);

    function handleClick(property: keyof User) {
        if(property === sortProperty){
            setAscendingOrder(!ascendingOrder);
        }else{
            setAscendingOrder(true);
        }

        setSortProperty(property)
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
            {sortedUsers.map((user) => ( <TableRow user={user} />))}
            </tbody>
        </table>

        <Paginatior currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />        
        </div>
    );
}
