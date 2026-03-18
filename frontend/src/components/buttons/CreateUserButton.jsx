const CreateUserButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm font-semibold text-indigo-700 border border-indigo-700 rounded-md hover:bg-indigo-100"
    >
      Create User
    </button>
  );
};
export default CreateUserButton;
