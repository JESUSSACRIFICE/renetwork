import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface NavLinkProps extends ComponentProps<typeof Link> {
  activeClassName?: string;
}

export const NavLink = ({ 
  href, 
  className, 
  activeClassName, 
  children, 
  ...props 
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        className,
        isActive && activeClassName
      )}
      {...props}
    >
      {children}
    </Link>
  );
};
