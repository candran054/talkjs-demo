import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "outline"
    | "cancel"
    | "secondary"
    | "yellow"
    | "cancelOutline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const variants = {
  primary: "text-secondary bg-main",
  secondary: "text-darkblue bg-secondary",
  yellow: "text-secondary bg-deeporange",
  outline: "text-main bg-white border border-solid border-main",
  cancel: "text-blackmain",
  cancelOutline: "text-darkgrey border border-solid border-[#D3DEE8]",
};

const sizes = {
  sm: "text-xs rounded-full py-3 px-8", 
  md: "text-sm rounded-full py-4 px-12",
  lg: "text-md rounded-full py-6 px-16",
};

export default function Button({
  children,
  variant = "primary",
  size = "sm",
  className,
  disabled,
  ...restProps
}: ButtonProps) {
  let variantClasses = variants[variant];
  let sizeClasses = sizes[size];

  return (
    <button
      className={`font-semibold ${
        disabled ? "text-secondary bg-grey cursor-default" : variantClasses
      } ${sizeClasses} ${className}`}
      {...restProps}
    >
      {children}
    </button>
  );
}
