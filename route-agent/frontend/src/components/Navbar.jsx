import "./Navbar.css";
import { FiTruck } from "react-icons/fi";
import { FaRoute } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FiTruck className="logo-icon" />

        <h1 className="logo-text">
          SupplySync <span>AI</span>
        </h1>
      </div>

      <div className="navbar-right">
        <FaRoute className="route-icon" />
        <span>Route Optimization</span>
      </div>
    </nav>
  );
}

export default Navbar;