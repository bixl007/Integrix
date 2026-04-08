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
    <div onClick={onClick} className="bg-card border border-border rounded-xl p-4 w-full max-w-md flex items-center cursor-pointer hover:bg-secondary/20 transition-all hover:-translate-y-0.5 hover:border-primary/50 relative group">
      {image && (
        <img src={image} width={42} className="rounded-full mr-4 border border-border p-1 bg-background" alt="" />
      )}
      <div className="flex items-center">
        <div className="text-sm font-mono font-bold text-muted-foreground bg-secondary px-2 py-1 rounded mr-4 min-w-[30px] text-center group-hover:text-foreground transition-colors">{index}.</div>
        <div className="text-lg font-medium text-foreground">{name}</div>
      </div>
      <div className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Edit →
      </div>
    </div>
  );
};
