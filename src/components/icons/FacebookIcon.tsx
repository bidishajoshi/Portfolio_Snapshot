export default function FacebookIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a6 6 0 0 0-6 6v9a9 9 0 0 0 9-9V2z"></path>
      <path d="M7 20H4a2 2 0 0 1-2-2V9a9 9 0 0 1 9-9 9 9 0 0 1 9 9"></path>
      <path d="M6 11h3v12H6z"></path>
    </svg>
  );
}
