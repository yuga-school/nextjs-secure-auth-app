"use client";

import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInputField = forwardRef<HTMLInputElement, Props>(
  ({ className, error = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={twMerge(
            "w-full rounded-md border-2 p-2 focus:outline-none focus:ring-2 pr-10", // pr-10を追加してアイコンスペース確保
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500",
            className
          )}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      </div>
    );
  }
);

PasswordInputField.displayName = "PasswordInputField";