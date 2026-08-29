import Spinner from "../icons/Spinner";

type CreateDataButtonProps = {
  title: string;
  loading: boolean;
};

const CreateDataButton = ({ title, loading }: CreateDataButtonProps) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex items-center justify-center w-full bg-indigo-700 text-white py-2 mt-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed ${!loading ? "hover:bg-indigo-500" : ""}`}
    >
      {loading ? (
        <>
          Creating <Spinner className="h-5 w-5 text-white ml-2" />
        </>
      ) : (
        title
      )}
    </button>
  );
};

export default CreateDataButton;
