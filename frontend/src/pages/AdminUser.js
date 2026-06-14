import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] =
    useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await axios.get(
            "https://quickwash-l49a.onrender.com/admin/users",
            {
              headers: {
                Authorization:
                  token,
              },
            }
          );

        setUsers(res.data);
      } catch (error) {
        console.log(error);
      }
    };

  const deleteUser =
    async (id) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await axios.delete(
          `https://quickwash-l49a.onrender.com/admin/users/${id}`,
          {
            headers: {
              Authorization:
                token,
            },
          }
        );

        fetchUsers();
      } catch (error) {
        console.log(error);
      }
    };

 return (
  <div className="admin-container">
    <header className="admin-header-strip">
      <div>
        <span className="admin-pill-tag">User Accounts</span>
        <h1>Registered Platform Clients</h1>
        <p>Manage permissions and access levels across registered system instances.</p>
      </div>
    </header>

    <div className="table-responsive-wrapper panel-card">
      <table className="admin-native-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email Address</th>
            <th>Assigned Role</th>
            <th style={{ textAlign: 'center' }}>System Management Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="bold-cell">💼 {user.username}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role?.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button className="table-action-delete-btn" onClick={() => deleteUser(user._id)}>
                  🗑️ Terminate Access
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default AdminUsers;