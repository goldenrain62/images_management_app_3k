"use client";

import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { Clock, ArrowLeft, Sparkles } from "lucide-react";

const ComingSoonPage = () => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="max-w-2xl w-full mx-auto px-6 py-12 text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div
            className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                : "bg-gradient-to-br from-blue-400 to-purple-500"
            } shadow-lg`}
          >
            <Clock className="w-12 h-12 text-white" strokeWidth={2} />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className={`text-5xl md:text-6xl font-bold mb-4 ${
            theme === "dark"
              ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
          }`}
        >
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p
          className={`text-xl md:text-2xl mb-6 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Chúng tôi đang phát triển tính năng này
        </p>

        {/* Description */}
        <p
          className={`text-base md:text-lg mb-8 max-w-xl mx-auto ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Trang này đang được xây dựng và sẽ sớm ra mắt với những tính năng tuyệt
          vời. Hãy quay lại sau nhé!
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`h-1 w-16 rounded-full ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : "bg-gradient-to-r from-blue-400 to-purple-500"
            }`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full mx-3 ${
              theme === "dark" ? "bg-purple-500" : "bg-purple-400"
            }`}
          ></div>
          <div
            className={`h-1 w-16 rounded-full ${
              theme === "dark"
                ? "bg-gradient-to-r from-purple-600 to-blue-500"
                : "bg-gradient-to-r from-purple-500 to-blue-400"
            }`}
          ></div>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            theme === "dark"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Progress indicators */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full animate-pulse ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-400"
              }`}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
