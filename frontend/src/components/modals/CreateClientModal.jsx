import { useState } from "react";
import Modal from "./Modal";

const CreateClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Client name is required.");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Creating client:", { name });

      // Call onSuccess callback to refresh client list
      onSuccess({ name });
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 text-white py-2 mt-2 rounded-md hover:bg-indigo-500 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </form>
    </Modal>
  );
};

export default CreateClientModal;
