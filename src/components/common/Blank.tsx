const Blank = ({ message }: { message: string }) => {
  return (
    <div>
      <div className="min-h-screen px-5 py-7 xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blank;
