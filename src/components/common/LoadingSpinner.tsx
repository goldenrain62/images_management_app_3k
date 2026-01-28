import { CircularProgress } from "@mui/material";

const LoadingSpinner = () => {
  return (
    <div>
      <div className="min-h-screen px-5 py-7 xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            <CircularProgress color="inherit" size={60} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
