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
    <div onClick={onClick} className="border border-black py-6 m-1 px-6 flex w-[300px] justify-center items-center cursor-pointer">
      {image && (
        <img src={image} width={30} className="rounded-full mr-3" alt="" />
      )}
      <div className="flex text-xl items-center">
        <div className="font-bold mr-2">{index}.</div>
        <div>{name}</div>
      </div>
    </div>
  );
};
