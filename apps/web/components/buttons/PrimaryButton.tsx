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
      onClick={onClick}
      className={`${size === "small" ? "text-sm px-4 py-2" : "text-base px-8 py-3.5"
        } font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2`}
    >
      {children}
    </button>
  );
};
