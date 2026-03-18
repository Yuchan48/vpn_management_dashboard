import Spinner from "./icons/Spinner";
const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-10 w-10 mr-3 text-gray-600" />
      <p className="text-gray-500 text-xl">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
