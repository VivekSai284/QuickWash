import React,
{
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AdminPartners =
  () => {
    const [
      partners,
      setPartners,
    ] = useState([]);

    useEffect(() => {
      fetchPartners();
    }, []);

    const fetchPartners =
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await axios.get(
            "https://quickwash-l49a.onrender.com/admin/partners",
            {
              headers: {
                Authorization:
                  token,
              },
            }
          );

        setPartners(
          res.data
        );
      };

    return (
  <div className="admin-container">
    <header className="admin-header-strip">
      <div>
        <span className="admin-pill-tag">Logistics Roster</span>
        <h1>Registered Fleet Crew</h1>
        <p>Onboarded delivery partners managed by your operations dispatch.</p>
      </div>
    </header>

    <div className="table-responsive-wrapper panel-card">
      <table className="admin-native-table">
        <thead>
          <tr>
            <th>Driver Name</th>
            <th>Email Address</th>
            <th>Mobile Line</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner._id}>
              <td className="bold-cell">🚚 {partner.username}</td>
              <td>{partner.email}</td>
              <td className="phone-cell">{partner.phone || "No Linked Phone"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
  };

export default AdminPartners;