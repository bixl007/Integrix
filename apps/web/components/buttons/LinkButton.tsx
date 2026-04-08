"use client";

import { ReactNode } from "react";

export const LinkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all flex items-center justify-center"
    >
      {children}
    </button>
  );
};
