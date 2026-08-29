import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-hot-toast";

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
import {
  validateUsername,
  validatePassword,
} from "../../utils/inputValidators";

import type { User } from "../../types/user";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  setUsers: Dispatch<SetStateAction<User[]>>;
  showModal: boolean;
};

const CreateUserModal = ({
  isOpen,
  onClose,
  currentUser,
  setUsers,
  showModal,
}: CreateUserModalProps) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // show/hide password
  const [show, setShow] = useState<boolean>(false);

  const isRootAdmin: boolean = currentUser?.id === 1;

  useEffect(() => {
    if (showModal) {
      setUsername("");
      setPassword("");
      setRole("user");
      setError("");
    }
  }, [showModal]);

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);

      const newUserInfo = { username, password, role };
      role === "admin"
        ? await createAdmin(newUserInfo, currentUser!)
        : await createUser(newUserInfo);
      // Show success message and refresh user list
      toast.success(
        `User "${username}" with role "${role}" created successfully`,
      );
      const usersData = await fetchAllUsers();
      setUsers(usersData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create user. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Create User"}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-w-md items-center space-y-3 w-full"
      >
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="w-full space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div className="w-full space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
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
              className="absolute inset-y-0 right-2 flex items-center w-6"
              aria-label={show ? "Hide password" : "Show password"}
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
          <div className="w-full space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-md border w-full border-gray-300 p-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <CreateDataButton title="Create User" loading={loading} />
      </form>
    </Modal>
  );
};

export default CreateUserModal;
