import { useState } from "react";

// import UI components
import CreateClientButton from "../buttons/CreateClientButton";
import CreateClientModal from "../modals/CreateClientModal";

const ClientsTable = ({ clients, user, setClients }) => {
  const [showModal, setShowModal] = useState(false);

  // group clients by username (for admin) or "My Clients" (for regular users)
  const groupedClients = clients.reduce((acc, client) => {
    const key = client.username || "My Clients";
    if (!acc[key]) acc[key] = [];
    acc[key].push(client);
    return acc;
  }, {});

  const deleteClient = (clientId) => {};

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4 mr-2">
        {" "}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Clients</h2>
        <CreateClientButton onClick={() => setShowModal(true)} />
      </div>

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
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full table-fixed text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="py-2 px-3 w-1/3">Name</th>
                    <th className="py-2 px-3 w-1/3">IP</th>
                    <th className="py-2 px-3 w-1/6 text-center">Status</th>
                    <th className="py-2 px-3 w-1/6 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {userClients.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-none hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-3 w-1/3 font-medium text-gray-800 truncate">
                        {c.name}
                      </td>
                      <td className="py-2 px-3 w-1/3 text-gray-600 truncate">
                        {c.ip_address}
                      </td>
                      <td className="py-2 px-3 w-1/6 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            c.status === "online"
                              ? "bg-green-100 text-green-700"
                              : c.status === "offline"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 w-1/6 text-center">
                        <button
                          onClick={() => deleteClient(c.id)}
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
          </div>
        ))}
      </div>
      <CreateClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(newClient) => setClients((prev) => [...prev, newClient])}
      />
    </div>
  );
};

export default ClientsTable;
