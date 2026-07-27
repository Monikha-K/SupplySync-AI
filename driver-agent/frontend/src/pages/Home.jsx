import { useState } from "react";
import ShipmentForm from "../components/ShipmentForm";
import DriverCard from "../components/DriverCard";
import DriverTable from "../components/DriverTable";
import Navbar from "../components/Navbar";
import api from "../services/api";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState(null);
  const [reason, setReason] = useState("");
  const [drivers, setDrivers] = useState([]);

  const recommendDriver = async (shipment) => {
    setLoading(true);

    try {
      const res = await api.post("/recommend-driver", shipment);

      const data = res.data;

      const best =
  data.top_candidates.find(
    d => d.driver_id === data.best_driver.driver_id
  ) || data.top_candidates[0];

      setDriver(best);
      setReason(data.best_driver.reason);
      setDrivers(data.top_candidates);
    } catch (err) {
      console.log(err);
      alert("Unable to recommend driver.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h1>
          Driver Recommendation <span>Agent</span>
        </h1>

        <p>AI-powered Smart Driver Selection for Logistics</p>

        <ShipmentForm onSubmit={recommendDriver} />

        {loading && (
          <div className="loading">
            Finding the best driver...
          </div>
        )}

        <DriverCard
          driver={driver}
          reason={reason}
        />

        <DriverTable
          drivers={drivers}
        />
      </div>
    </>
  );
};

export default Home;