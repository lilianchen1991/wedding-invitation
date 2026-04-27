interface LogoProps {
  className?: string;
  color?: string;
}

export default function Logo({ className = "h-8", color = "currentColor" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 112"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M3 0H37V2H25V110H37V112H3V110H15V2H3Z" />
      <path d="M63 0H97V2H85V110H97V112H63V110H75V2H63Z" />
      <path d="M25 26C46 18 66 72 75 88V93C64 77 44 24 25 31Z" />
    </svg>
  );
}
