const CreateClientButton = ({ onClick }) => {
  return (
    <button
      className="px-3 py-2 text-sm font-semibold text-indigo-700 border border-indigo-700 rounded-md hover:bg-indigo-100"
      onClick={onClick}
    >
      Create Client
    </button>
  );
};

export default CreateClientButton;
