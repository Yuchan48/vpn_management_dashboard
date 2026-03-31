import { useState } from "react";
import { toast } from "react-hot-toast";

// import UI components
import OpenModalButton from "../buttons/OpenModalButton";
import CreateClientModal from "../modals/CreateClientModal";
import DeleteButton from "../buttons/DeleteButton";
import DownloadButton from "../buttons/DownloadButton";

// import functions
import { deleteClient, downloadConfFile } from "../../services/clientService";

const ClientsTable = ({ clients, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  // group clients by username (for admin) or "My Clients" (for regular users)
  const groupedClients = clients.reduce((acc, client) => {
    const key = client.username || "My Clients";
    if (!acc[key]) acc[key] = [];
    acc[key].push(client);
    return acc;
  }, {});

  const handleOpenModal = () => {
    setError("");

    const myClientsCount =
      (groupedClients[user.username || "My Clients"] || []).filter(
        (c) => c.userId === user.id,
      ).length || 0;
    if (myClientsCount >= 5) {
      setError("You have reached the maximum of 5 clients. ");
      return;
    }
    setShowModal(true);
  };

  const deleteClientHandler = async (client) => {
    setError("");
    if (
      !window.confirm(
        `Are you sure you want to delete client "${client.name}"?`,
      )
    )
      return;

    try {
      setLoadingId(client.clientId);
      // Call API to delete client
      await deleteClient(client, user);

      toast.success(`Client "${client.name}" deleted successfully.`);
    } catch (err) {
      setError(err.message || "Failed to delete client. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const downloadClientHandler = async (client) => {
    setError("");

    try {
      setLoadingId(client.clientId);
      await downloadConfFile(client.clientId, client.name);
    } catch (err) {
      setError(
        err.message || "Failed to download client config. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4 mr-2">
        {" "}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Clients</h2>
        <OpenModalButton
          onClick={handleOpenModal}
          title="Create Client"
          disabled={loadingId !== null}
        />
      </div>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="py-6 text-center text-gray-600 italic">
          No clients found. Click "Create Client" to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClients).map(([username, userClients]) => (
            <div key={username}>
              {/* Group Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {username}
                </h3>
                <span className="text-xs text-gray-400">
                  {userClients.length} client{userClients.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto ">
                <table className="min-w-[600px] w-full table-fixed text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b">
                    <tr>
                      <th className="py-2 px-3 w-1/3">Name</th>
                      <th className="py-2 px-3 w-1/6">IP</th>
                      <th className="py-2 px-3 w-1/6 text-center">Status</th>
                      <th className="py-2 px-3 w-1/6 text-center">Download</th>
                      <th className="py-2 px-3 w-1/6 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {userClients.map((c) => (
                      <tr
                        key={c.clientId}
                        className="border-b last:border-none hover:bg-gray-50 transition"
                      >
                        <td className="py-2 px-3 w-1/3 font-medium text-gray-800 truncate">
                          {c.name}
                        </td>
                        <td className="py-2 px-3 w-1/6 text-gray-600 truncate">
                          {c.allowedIPs}
                        </td>
                        <td className="py-2 px-3 w-1/6 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              c.status === "Online"
                                ? "bg-green-100 text-green-700"
                                : c.status === "Offline"
                                  ? "bg-gray-200 text-gray-600"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 w-1/6 text-center">
                          <div className="flex justify-center">
                            {" "}
                            <DownloadButton
                              onClick={() => {
                                downloadClientHandler(c);
                              }}
                              disabled={loadingId === c.clientId}
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 w-1/6 text-center">
                          <DeleteButton
                            onClick={() => {
                              deleteClientHandler(c);
                            }}
                            disabled={loadingId === c.clientId}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
      <CreateClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        showModal={showModal}
        isDemo={user.is_demo === 1}
      />
    </div>
  );
};

export default ClientsTable;
