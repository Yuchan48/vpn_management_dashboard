import {
  useState,
  lazy,
  Suspense,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "react-hot-toast";

// import functions
import { deleteUser } from "../../services/userService";

// import UI components
import OpenModalButton from "../buttons/OpenModalButton";
const CreateUserModal = lazy(() => import("../modals/CreateUserModal"));
import DeleteButton from "../buttons/DeleteButton";
import Spinner from "../icons/Spinner";

import type { User } from "../../types/user";

type UsersTableProps = {
  users: User[];
  user: User;
  setUsers: Dispatch<SetStateAction<User[]>>;
  onUserDeleted: () => void;
};

const UsersTable = ({
  users,
  user,
  setUsers,
  onUserDeleted,
}: UsersTableProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const deleteUserHandler = async (idToDelete: number): Promise<void> => {
    // call delete user API
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoadingId(idToDelete);
      await deleteUser(idToDelete, user);
      // remove the deleted user from the list
      setUsers((prev) => prev.filter((u) => u.id !== idToDelete));
      // refresh clients to fetch new clients data after user deletion
      onUserDeleted();
      // Show success message and refresh user list
      toast.success("User deleted successfully");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4 mr-2">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <OpenModalButton
          onClick={() => {
            setShowModal(true);
            setError("");
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
        <table className="min-w-[430px] w-full text-sm text-left table-fixed">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2 w-1/10">ID</th>
              <th className="py-2 w-3/10">Username</th>
              <th className="py-2 w-1/5">Role</th>
              <th className="py-2 w-1/5">Created</th>
              <th className="py-2 w-1/5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 w-1/10">{u.id}</td>
                <td className="py-2 w-3/10 truncate ">{u.username}</td>
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
      <Suspense
        fallback={
          <div className="text-center mt-4">
            <Spinner aria-hidden="true" className="h-6 w-6 text-indigo-600" />
          </div>
        }
      >
        <CreateUserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          currentUser={user}
          setUsers={setUsers}
          showModal={showModal}
        />
      </Suspense>
    </div>
  );
};

export default UsersTable;
