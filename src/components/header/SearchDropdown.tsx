"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryResult {
  id: string;
  name: string;
}

interface ImageResult {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  categoryName: string | null;
}

interface SearchResults {
  categories: CategoryResult[];
  images: ImageResult[];
}

const SearchDropdown = ({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [results, setResults] = useState<SearchResults>({
    categories: [],
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ categories: [], images: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ categories: [], images: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path: string) => {
    router.push(path);
    onClose();
  };

  const hasResults = results.categories.length > 0 || results.images.length > 0;

  return (
    <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {isLoading ? (
        <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Đang tìm kiếm...
        </div>
      ) : !hasResults ? (
        <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Không tìm thấy kết quả nào
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto py-2">
          {results.categories.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Loại sàn
              </div>
              {results.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(`/categories/${cat.id}?name=${encodeURIComponent(cat.name)}`)}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg
                    className="h-4 w-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results.categories.length > 0 && results.images.length > 0 && (
            <div className="mx-4 my-1 border-t border-gray-100 dark:border-gray-800" />
          )}

          {results.images.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Hình ảnh
              </div>
              {results.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => handleSelect(`/images/${img.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {img.thumbnailUrl ? (
                    <img
                      src={img.thumbnailUrl}
                      alt={img.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-4 w-4 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L22 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {img.name}
                    </span>
                    {img.categoryName && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {img.categoryName}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
