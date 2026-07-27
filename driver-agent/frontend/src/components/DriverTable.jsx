const DriverTable = ({ drivers }) => {

  if (!drivers || drivers.length === 0) return null;

  return (

    <div className="table-card">

      <h2>Top 5 Candidate Drivers</h2>

      <table>

        <thead>

          <tr>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Score</th>
            <th>Rating</th>
            <th>Experience</th>
          </tr>

        </thead>

        <tbody>

          {drivers.map((driver) => (

            <tr key={driver.driver_id}>

              <td>{driver.name}</td>

              <td>{driver.vehicle_type}</td>

              <td>{driver.recommendation_score}</td>

              <td>{driver.overall_rating}</td>

              <td>{driver.experience_years} yrs</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
};

export default DriverTable;