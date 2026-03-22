import { useState } from "react";

// import functions
import { deleteUser } from "../../services/userService";

// import UI components
import CreateButton from "../buttons/CreateButton";
import CreateUserModal from "../modals/CreateUserModal";
import DeleteButton from "../buttons/DeleteButton";

const UsersTable = ({ users, user, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  const deleteUserHandler = async (idToDelete) => {
    // call delete user API
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoadingId(idToDelete);
      await deleteUser(idToDelete, user);
      // remove the deleted user from the list
      setUsers((prev) => prev.filter((u) => u.id !== idToDelete));
      // Show success message and refresh user list
      alert("User deleted successfully");
    } catch (err) {
      setError(err.message || "Failed to delete user. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4 mr-2">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <CreateButton
          onClick={() => {
            setShowModal(true);
          }}
          title="Create User"
          disabled={loadingId !== null}
        />
      </div>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

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
                <td className="py-2 w-1/5 text-center">
                  <DeleteButton
                    onClick={() => deleteUserHandler(u.id)}
                    disabled={loadingId === u.id}
                  />
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
