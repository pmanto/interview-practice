import { memo } from "react";
import type { User } from "../types/User";

interface TableRowProps {
  user: User;
}

function TableRow({user}:TableRowProps) {
    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.createdAt}</td>
        </tr>
    )
}

// Skip re-rendering rows whose user object hasn't changed
export default memo(TableRow);
