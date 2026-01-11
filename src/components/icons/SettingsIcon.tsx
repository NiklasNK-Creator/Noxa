interface IconProps {
  size?: number;
  className?: string;
}

// Clean modern gear (settings)
export default function SettingsIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* center */}
      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* gear */}
      <path
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l1.72-1.34a.5.5 0 0 0 .12-.64l-1.64-2.84a.5.5 0 0 0-.6-.22l-2.02.81a7.1 7.1 0 0 0-1.63-.94l-.31-2.15a.5.5 0 0 0-.5-.42h-3.28a.5.5 0 0 0-.5.42l-.31 2.15c-.58.22-1.12.53-1.63.94l-2.02-.81a.5.5 0 0 0-.6.22L3 8.02a.5.5 0 0 0 .12.64l1.72 1.34c-.04.31-.06.63-.06.94s.02.63.06.94L3.12 13.2a.5.5 0 0 0-.12.64l1.64 2.84c.13.23.4.32.6.22l2.02-.81c.5.41 1.05.72 1.63.94l.31 2.15c.04.24.25.42.5.42h3.28c.25 0 .46-.18.5-.42l.31-2.15c.58-.22 1.12-.53 1.63-.94l2.02.81c.2.1.47.01.6-.22l1.64-2.84a.5.5 0 0 0-.12-.64l-1.72-1.34z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
