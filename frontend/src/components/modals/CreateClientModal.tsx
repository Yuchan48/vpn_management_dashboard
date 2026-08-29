import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { customAlphabet } from "nanoid";

// import UI components
import Modal from "./Modal";
import CreateDataButton from "../buttons/CreateDataButton";

// import functions
import { createClient } from "../../services/clientService";
import { validateClientName } from "../../utils/inputValidators";

type CreateClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showModal: boolean;
  isDemo: boolean;
};

const CreateClientModal = ({
  isOpen,
  onClose,
  showModal,
  isDemo,
}: CreateClientModalProps) => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Client">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-w-md items-center space-y-3 w-full"
      >
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="w-full space-y-2">
          <label
            htmlFor="client-name"
            className="block text-sm font-medium text-gray-700"
          >
            Client Name
          </label>
          <input
            id="client-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <CreateDataButton title="Create Client" loading={loading} />
      </form>
    </Modal>
  );
};

export default CreateClientModal;
