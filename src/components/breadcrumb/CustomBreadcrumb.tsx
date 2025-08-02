import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useEffect, useState } from "react";

import { Link } from "react-router";
import { useBreadcrumb } from "./BreadcrumbContext";

// Custom Hook to detect screen width
function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 640); // Tailwind "sm" = 640px
      setIsTablet(width >= 640 && width < 1024); // md: 768px, lg: 1024px
    }

    handleResize(); // Set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
}

function CustomBreadcrumb() {
  const { breadcrumbs } = useBreadcrumb();
  const { isMobile } = useBreakpoint();

  // Set maximum items based on screen
  const maxVisible = isMobile ? 1 : 4;

  return (
    <Breadcrumb className="w-full px-1">
      <BreadcrumbList className="gap-1 sm:gap-1 items-center flex-nowrap">
        {breadcrumbs.length <= maxVisible ? (
          // Show directly
          breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="truncate max-w-24 md:max-w-40 hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <BreadcrumbPage
                    className="truncate max-w-24 md:max-w-40"
                    title={item.label}
                  >
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))
        ) : (
          <>
            {/* Dropdown for middle breadcrumbs */}
            {isMobile ? (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {breadcrumbs.slice(0, -1).map((item, index) => (
                        <Link to={item.href || "/"} key={index}>
                          <DropdownMenuItem>{item.label}</DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-26 md:max-w-40">
                    {breadcrumbs[breadcrumbs.length - 1].label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <>
                {/* First breadcrumb item */}
                <BreadcrumbItem>
                  <Link to={breadcrumbs[0].href || "/"}>
                    {breadcrumbs[0].label}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {breadcrumbs.slice(1, -2).map((item, index) => (
                        <Link to={item.href || "/"} key={index}>
                          <DropdownMenuItem>{item.label}</DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to={breadcrumbs[breadcrumbs.length - 2].href || "/"}>
                    {breadcrumbs[breadcrumbs.length - 2].label}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {breadcrumbs[breadcrumbs.length - 1].label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default CustomBreadcrumb;