// src/app/_components/Button.tsx
"use client";

import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { tv, type VariantProps } from "tailwind-variants";
import { twMerge } from "tailwind-merge";

// 1. ボタンのスタイルバリエーションを定義
const button = tv({
  base: "inline-flex items-center justify-center rounded-md px-4 py-2 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  variants: {
    variant: {
      indigo: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      light: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
      ghost: "bg-transparent text-white hover:bg-slate-700 focus:ring-slate-500",
    },
    width: {
      auto: "w-auto",
      stretch: "w-full",
    },
  },
  defaultVariants: {
    variant: "indigo",
    width: "auto",
  },
});

// 2. Propsの型定義を拡張
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    isBusy?: boolean;
  };

// 3. Buttonコンポーネントの実装
export const Button: React.FC<ButtonProps> = ({
  variant,
  width,
  isBusy = false,
  className,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={twMerge(button({ variant, width }), className)}
      disabled={isBusy || props.disabled}
    >
      {isBusy ? (
        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
      ) : null}
      {children}
    </button>
  );
};