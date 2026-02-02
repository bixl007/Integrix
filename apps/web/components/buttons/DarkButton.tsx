import { ReactNode } from "react";

export const DarkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div className="bg-purple-600 text-white cursor-pointer hover:bg-purple-700 rounded-full hover:shadow-lg py-3 px-12 text-center" onClick={onClick}>{children}</div>
  );
};
