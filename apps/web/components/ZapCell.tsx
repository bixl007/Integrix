export const ZapCell = ({
  name,
  index,
  onClick,
  image
}: {
  name?: string;
  index: number;
  onClick: () => void;
  image?: string;
}) => {
  return (
    <div onClick={onClick} className="bg-white shadow-md rounded-lg p-6 w-full max-w-md flex items-center cursor-pointer hover:shadow-lg transition-shadow duration-200">
      {image && (
        <img src={image} width={40} className="rounded-full mr-4" alt="" />
      )}
      <div className="flex items-center">
        <div className="text-2xl font-bold text-orange-500 mr-4">{index}</div>
        <div className="text-xl text-gray-800">{name}</div>
      </div>
    </div>
  );
};
