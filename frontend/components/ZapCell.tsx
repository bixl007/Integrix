export const ZapCell = ({ name, index }: { name?: string; index: number }) => {
  return (
    <div className="border border-black py-6 m-1 px-6 flex w-[300px] justify-center cursor-pointer">
      <div className="flex text-xl">
        <div className="font-bold">{index}</div>
        <div>{name}</div>
      </div>
    </div>
  );
};
