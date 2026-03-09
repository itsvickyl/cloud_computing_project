import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Logo } from "../ui/logo";
import UserDropdownWrapper from "./user-dropdown-wrapper";
import { ROUTES } from "@/config/routes";
import { User, UserType } from "@/types";

const PublicNavbar = async ({ user }: { user?: User }) => {
  return (
    <nav className="flex items-center justify-between py-6 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Logo size="md" showText={true} href={ROUTES.HOME} className="hidden sm:flex" />
        <Logo size="md" showText={false} href={ROUTES.HOME} className="sm:hidden" />
        <Link
          href={ROUTES.PRICING}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "font-medium hover:bg-accent transition-all",
          })}
        >
          Pricing
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {user && user.type === "org" && (
          <Link
            className={buttonVariants({
              size: "lg",
              className: "font-semibold shadow-md hover:shadow-lg transition-all",
            })}
            href={ROUTES.POST_JOB}
          >
            Post Job
          </Link>
        )}

        {user ? (
          <UserDropdownWrapper
            email={user.email!}
            name={user.username!}
            image={user.profilePic!}
            type={user.type! as UserType}
          />
        ) : (
          <Link
            href={ROUTES.LOGIN}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "font-semibold border-border/50 hover:border-primary/50 hover:bg-accent transition-all shadow-none",
            })}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
