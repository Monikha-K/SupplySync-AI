import "./AlternativeRoutes.css";

function AlternativeRoutes({ routes }) {
  return (
    <div className="alternative-card">

      <h2>🛣 Alternative Routes</h2>

      <table>

        <thead>
          <tr>
            <th>Route</th>
            <th>Distance</th>
            <th>Duration</th>
            <th>Traffic</th>
            <th>Toll</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>

          {routes.map((route, index) => (

            <tr key={index}>

              <td>{route.route_name}</td>

              <td>{route.distance_km} km</td>

              <td>{route.duration_hr} hrs</td>

              <td>{route.traffic}</td>

              <td>₹ {route.toll_cost}</td>

              <td>{route.score}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AlternativeRoutes;