export const Input = ({
  label,
  onChange,
  type = "text",
}: {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password";
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-gray-500">
        <label>*{label}</label>
      </div>
      <input
        type={type}
        onChange={onChange}
        className="mb-3 border border-black rounded py-2 m w-full text-center"
        required
      />
    </div>
  );
};
