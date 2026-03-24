import Spinner from "../icons/Spinner";
const DownloadButton = ({ onClick, disabled }) => {
  return (
    <button
      className={`inline-flex items-center justify-center px-1 py-1 text-xs font-semibold text-indigo-600 border border-indigo-600 rounded-md disabled:text-gray-500 disabled:border-gray-500 disabled:cursor-not-allowed ${!disabled ? "hover:bg-indigo-100" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? (
        <>
          Downloading <Spinner className="h-3 w-3 text-gray-500 ml-1" />
        </>
      ) : (
        "Download"
      )}
    </button>
  );
};

export default DownloadButton;
