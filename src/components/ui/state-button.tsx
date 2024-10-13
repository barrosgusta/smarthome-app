import { twMerge } from "tailwind-merge";

type StateButtonProps = {
  state: boolean;
  onClick: (state: boolean) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export default function StateButton({
  state,
  onClick,
  icon,
  children,
}: StateButtonProps) {
  return (
    <button
      onClick={() => onClick(!state)}
      className={twMerge(
        `transition-all duration-200 shadow-md flex justify-center items-center gap-2 px-6 py-4 rounded-md ${
          state ? "bg-green-500" : "bg-red-500"
        } text-white`
      )}
    >
      {icon}
      {children}
    </button>
  );
}
