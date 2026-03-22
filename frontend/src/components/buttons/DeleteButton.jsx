import Spinner from "../icons/Spinner";
const DeleteButton = ({ onClick, disabled }) => {
  return (
    <button
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-red-600 border border-red-600 rounded-md disabled:text-gray-500 disabled:border-gray-500 disabled:cursor-not-allowed ${!disabled ? "hover:bg-red-100" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? (
        <>
          Deleting <Spinner className="h-3 w-3 text-gray-500 ml-1" />
        </>
      ) : (
        "Delete"
      )}
    </button>
  );
};

export default DeleteButton;
