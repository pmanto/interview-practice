import DataTable from "./components/DataTable";
import { generateUsers } from './data/generateUsers'

import './App.css'
import { useState } from "react";
import type { User } from "./types/User";

function App() {
  const [users] = useState<User[]>(generateUsers(100_000))


  return (
    <DataTable users={users} />
  );
}

export default App
