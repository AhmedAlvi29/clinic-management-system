import { Routes, Route } from "react-router";

import Login from "./components/Login";
import Dashboard from "./components/dashboard"
function App() {
  return (
<div>
  <Routes>

    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
  
  </Routes>
</div>
  )
}

export default App