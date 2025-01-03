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
    <div
      className={`${size === "small" ? "text-sm" : "text-lg"} ${
        size === "small" ? "px-4 py-2" : "px-8 py-2"
      } bg-amber-600 text-white cursor-pointer hover:bg-amber-700`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
