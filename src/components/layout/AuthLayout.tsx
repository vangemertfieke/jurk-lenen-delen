import type { ReactNode } from "react";
import dressImg from "@/assets/dress-2.jpg";

export function AuthLayout({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          <h1 className="display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{intro}</p>
          <div className="mt-10">{children}</div>
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
      <div className="hidden bg-blush lg:block">
        <img
          src={dressImg}
          alt="Vrouw in een zwarte satijnen jurk"
          loading="lazy"
          width={900}
          height={1200}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
