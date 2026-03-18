const ErrorScreen = ({ error }) => {
  return (
    <div className="flex items-center justify-center text-xl h-screen">
      <p className="text-red-500">Error: {error}</p>
    </div>
  );
};

export default ErrorScreen;
