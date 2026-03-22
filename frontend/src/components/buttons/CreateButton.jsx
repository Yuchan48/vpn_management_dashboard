import Spinner from "../icons/Spinner";
const CreateButton = ({ onClick, title, disabled }) => {
  return (
    <button
      className={`inline-flex items-center justify-center px-3 py-2 text-sm font-semibold text-indigo-700 border border-indigo-700 rounded-md disabled:text-gray-500 disabled:border-gray-500 disabled:cursor-not-allowed ${!disabled ? "hover:bg-indigo-100" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? (
        <>
          Processing <Spinner className="h-3 w-3 text-gray-500 ml-1" />
        </>
      ) : (
        title
      )}
    </button>
  );
};

export default CreateButton;
