import type { User } from "../types/User";

interface TableRowProps {
  user: User;
}

export default function TableRow({user}:TableRowProps) {
    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.createdAt}</td>
        </tr>
    )
}