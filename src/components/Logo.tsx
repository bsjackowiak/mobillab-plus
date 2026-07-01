import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-[20px] font-bold tracking-[-0.03em]">
      Lab<span className="text-accent">Flow</span>
    </Link>
  );
}
