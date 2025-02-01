import { ReactNode } from "react";

export const SecondaryButton = ({
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
      onClick={onClick}
      className={`${size === "small" ? "text-sm" : "text-lg"} ${
        size === "small" ? "px-8 py-2" : "px-10 py-2"
      } cursor-pointer rounded-full hover:shadow-lg border border-black hover:bg-black hover:text-white`}
    >
      {children}
    </div>
  );
};
 