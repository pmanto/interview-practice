import DataTable from "./components/DataTable";
import { users } from './data/users'

import './App.css'

function App() {
  return <DataTable users={users} />;
}

export default App
