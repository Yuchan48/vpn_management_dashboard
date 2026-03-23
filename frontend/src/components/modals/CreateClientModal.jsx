import { useState, useEffect } from "react";

// import UI components
import Modal from "./Modal";
import CreateDataButton from "../buttons/CreateDataButton";

// import functions
import {
  createClient,
  downloadConfFile,
  fetchClients,
} from "../../services/clientService";

const CreateClientModal = ({ isOpen, onClose, setClients, showModal }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      setName("");
      setError("");
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }

    try {
      setLoading(true);
      const configText = await createClient({ name });
      const filename = `client_${name}.conf`;
      downloadConfFile(configText, filename);
      alert(`Client "${name}" created successfully`);
      const clientsData = await fetchClients();
      setClients(clientsData);

      onClose();
    } catch (err) {
      setError(err.message || "Failed to create client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <CreateDataButton
          onClick={handleSubmit}
          title="Create Client"
          loading={loading}
        />
      </form>
    </Modal>
  );
};

export default CreateClientModal;
