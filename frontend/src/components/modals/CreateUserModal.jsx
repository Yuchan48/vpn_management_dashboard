import { useState } from "react";

// import UI components
import CreateDataButton from "../buttons/CreateDataButton";
import Modal from "./Modal";
import EyeIcon from "../icons/EyeIcon";
import EyeOffIcon from "../icons/EyeOffIcon";

// import functions
import {
  createUser,
  createAdmin,
  fetchAllUsers,
} from "../../services/userService";

const CreateUserModal = ({ isOpen, onClose, currentUser, setUsers }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // show/hide password
  const [show, setShow] = useState(false);

  const isRootAdmin = currentUser?.id === 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      const newUserInfo = { username, password, role };
      role === "admin"
        ? await createAdmin(newUserInfo, currentUser)
        : await createUser(newUserInfo);
      // Show success message and refresh user list
      alert(`User "${username}" with role "${role}" created successfully`);
      const usersData = await fetchAllUsers();
      setUsers(usersData);
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
          <div className="mt-1 relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="block w-full rounded-md border border-gray-300 p-2"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-2 flex items-center"
            >
              {show ? (
                <EyeOffIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
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

        <CreateDataButton
          onClick={handleSubmit}
          title="Create User"
          loading={loading}
        />
      </form>
    </Modal>
  );
};

export default CreateUserModal;
