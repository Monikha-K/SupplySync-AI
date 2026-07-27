import { FaTruck } from "react-icons/fa";
import { Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <FaTruck className="logo-icon" />
        <span>
          SupplySync <span className="highlight">AI</span>
        </span>
      </div>

      <div className="nav-title">
        <Sparkles size={18} />
        <span>Driver Recommendation</span>
      </div>
    </nav>
  );
};

export default Navbar;