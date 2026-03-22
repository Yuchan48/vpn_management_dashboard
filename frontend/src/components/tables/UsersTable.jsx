import { useState } from "react";

// import UI components
import CreateUserButton from "../buttons/CreateUserButton";
import CreateUserModal from "../modals/CreateUserModal";

const UsersTable = ({ users, user, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const deleteUser = (idToDelete) => {
    // root admin (id=1) cannot be deleted
    // only root admin (id=1) can delete other admins
    // admins can delete users
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4 mr-2">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <CreateUserButton
          onClick={() => {
            setShowModal(true);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2 w-1/5">ID</th>
              <th className="py-2 w-1/5">Username</th>
              <th className="py-2 w-1/5">Role</th>
              <th className="py-2 w-1/5">Created</th>
              <th className="py-2 w-1/5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 w-1/5">{u.id}</td>
                <td className="py-2 w-1/5 truncate">{u.username}</td>
                <td className="py-2 w-1/5">{u.role}</td>
                <td className="py-2 w-1/5">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 text-center w-1/4">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-2 py-1 text-xs font-semibold text-red-600 border border-red-600 rounded-md hover:bg-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentUser={user}
        setUsers={setUsers}
        /* onSuccess={(newUser) => setUsers((prev) => [...prev, newUser])} */
      />
    </div>
  );
};

export default UsersTable;
