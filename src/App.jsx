import { Routes, Route } from "react-router";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Savepitchs from "./components/savepitchs"
import Home from "./components/home"
// import Logo from "./components/logo"
function App() {
  return (
<div>
  <Routes>

    <Route path="/" element={<Login />} />
    <Route path="/savepitchs" element={<Savepitchs />} />
    {/* <Route path="/logo" element={<Logo />} /> */}
    <Route path="/home" element={<Home />} />
    <Route path="/signup" element={<Signup />} />
  
  </Routes>
</div>
  )
}

export default App