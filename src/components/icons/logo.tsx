import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-chef-hat", className)}
  >
    <path d="M17.26 10.74c-.2-.68-.34-1.39-.34-2.15 0-2.22 1.34-4.22 3.32-5.11.72-.32 1.78-.06 2 .6-.22.68.34 1.39.34 2.15 0 2.22-1.34 4.22-3.32 5.11-.72.32-1.78.06-2-.6Z" />
    <path d="M6.74 10.74c.2-.68.34-1.39.34-2.15 0-2.22-1.34-4.22-3.32-5.11-.72-.32-1.78-.06-2 .6.22.68-.34 1.39-.34 2.15 0 2.22 1.34 4.22 3.32 5.11.72.32 1.78.06 2-.6Z" />
    <path d="M12 2.1c.22-.68-.34-1.39-.34-2.15 0-2.22 1.34-4.22 3.32-5.11.72-.32 1.78-.06 2 .6-.22.68.34 1.39.34 2.15 0 2.22-1.34 4.22-3.32 5.11-.72.32-1.78.06-2-.6Z" transform="rotate(180 12 4.59)" />
    <path d="M12 11.5a3.5 3.5 0 0 1-3.5-3.5V2.5h7v5.5a3.5 3.5 0 0 1-3.5 3.5Z" />
    <path d="M18 21h-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4H2v-2h20v2Z" />
  </svg>
);
