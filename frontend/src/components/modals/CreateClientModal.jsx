import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { customAlphabet } from "nanoid";

// import UI components
import Modal from "./Modal";
import CreateDataButton from "../buttons/CreateDataButton";

// import functions
import { createClient } from "../../services/clientService";

import { validateClientName } from "../../utils/inputValidators";

const CreateClientModal = ({ isOpen, onClose, showModal, isDemo }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      setName("");
      setError("");
    }
    if (isDemo) {
      // for demo users, pre-fill the client name with unique value.
      const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
      const nanoidCustom = customAlphabet(alphabet, 8); // control length and characters of the generated ID
      const name = `demo-${nanoidCustom()}`;
      setName(name);
    }
  }, [showModal, isDemo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateClientName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await createClient(name);

      toast.success(`Client "${name}" created successfully`);

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
