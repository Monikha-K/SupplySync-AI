import "./RouteCard.css";

function RouteCard({ routeData }) {

  const route = routeData.recommended_route;

  return (

    <div className="route-card">

      <h2>🏆 Recommended Route</h2>

      <div className="route-grid">

        <div>
          <h4>Route</h4>
          <p>{route.route_name}</p>
        </div>

        <div>
          <h4>Distance</h4>
          <p>{route.distance_km} km</p>
        </div>

        <div>
          <h4>Duration</h4>
          <p>{route.duration_hr} hrs</p>
        </div>

        <div>
          <h4>Traffic</h4>
          <p>{route.traffic}</p>
        </div>

        <div>
          <h4>Toll Cost</h4>
          <p>₹ {route.toll_cost}</p>
        </div>

        <div>
          <h4>Score</h4>
          <p>{route.score}</p>
        </div>

      </div>

    </div>

  );
}

export default RouteCard;