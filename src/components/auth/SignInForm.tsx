"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to /images
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/images");
    }
  }, [status, session, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        // Display error message from server
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Successful login - redirect to home page
        router.push("/");
        router.refresh(); // Refresh to update session
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập email và mật khẩu để sử dụng hệ thống
            </p>
          </div>
          <div>
            <form onSubmit={handleSignIn}>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(""); // Clear error when typing
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(""); // Clear error when typing
                      }}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="text-theme-sm block font-normal text-gray-700 dark:text-gray-400">
                      Remember me
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm"
                  >
                    Đổi mật khẩu?
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng nhập..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
