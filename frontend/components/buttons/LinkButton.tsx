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
    <div className="px-2 py-2 cursor-pointer hover:bg-slate-100 text-sm font-normal text-gray-500" onClick={onClick}>
      {children}
    </div>
  );
};
