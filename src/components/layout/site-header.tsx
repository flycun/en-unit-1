import Link from "next/link";
import { Headphones } from "lucide-react";

/** 顶部导航栏 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Headphones className="h-5 w-5" />
          </span>
          <span>
            英语听力<span className="text-primary">课堂</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="hidden sm:inline">人教 PEP · 三起</span>
        </nav>
      </div>
    </header>
  );
}
