import { useState } from "react";
import Modal from "./Modal";

const CreateUserModal = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRootAdmin = currentUser?.id === 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Creating user:", { username, password, role });

      // Call onSuccess callback to refresh user list
      onSuccess({ username, role });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Create User"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        {isRootAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 text-white py-2 mt-2 rounded-md hover:bg-indigo-500 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
