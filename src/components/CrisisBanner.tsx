import { Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";

export function CrisisBanner() {
  return (
    <div className="border-b border-border bg-surface-2/60">
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
        <LifeBuoy className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          If you're in immediate danger or thinking about harming yourself, please contact your
          local emergency services right away.{" "}
          <Link to="/resources" className="text-primary underline underline-offset-4">
            Help resources
          </Link>
        </p>
      </div>
    </div>
  );
}
