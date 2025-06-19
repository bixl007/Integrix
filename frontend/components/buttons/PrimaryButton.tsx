import { ReactNode } from "react";

export const PrimaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "small" | "large";
}) => {
  return (
    <button
      className={`${size === "small" ? "text-sm" : "text-lg"} ${
        size === "small" ? "px-4 py-2" : "px-8 py-4"
      } font-semibold bg-orange-500 text-white cursor-pointer hover:bg-orange-600 rounded-full hover:shadow-lg flex justify-center items-center transition-all duration-200`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
