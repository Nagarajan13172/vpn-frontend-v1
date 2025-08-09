
import { Outlet } from "react-router";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ModeToggle } from "@/components/ThemeProvider/mode-toggle";
import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import { getCookie } from "typescript-cookie";

export default function SideMenuLayout() {
    const open = getCookie("sidebar_state") === "true" ? true : false;

    return (
        <SidebarProvider defaultOpen={open}>
            <AppSidebar />
            <SidebarInset>
                <header
                    className="flex py-2 md:py-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12
        sticky top-0 z-50 bg-background shadow-sm border-b"
                >
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="bg-foreground/50 w-[1px] h-5"
                        />
                        {/* <CustomBreadcrumb /> */}
                        <CustomBreadcrumb />
                    </div>

                    <div className="flex justify-end items-center gap-2 flex-1 px-4">
                        <ModeToggle />
                    </div>
                </header>
                <div className="p-2 md:p-4 w-full overflow-x-hidden">
                    <div className="min-h-[80h]">
                        <Outlet />
                    </div>
                    <footer className="w-full text-center py-4 text-sm text-muted-foreground">
                        Made with ❣️ by{" "}
                        <a
                            href="https://bloomskilltech.youngstorage.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-primary text-blue-500"
                        >
                            BloomSkillTech
                        </a>
                    </footer>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}