"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Calendar, Home, Table2, Bot } from "lucide-react";

/**
 * Navigation items for the sidebar
 * Each item has a title, URL path, and icon
 */
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Tables",
    url: "/tables",
    icon: Table2,
  },
  {
    title: "Baddies AI",
    url: "/baddiesai",
    icon: Bot,
  },
  // Commented out items retained for future use
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings2,
  // },
  // {
  //   title: "Profile",
  //   url: "/profile",
  //   icon: UserRound,
  // },
];

/**
 * SidebarComponent - Main navigation sidebar for the application
 * Features responsive design (hidden on mobile) and active state highlighting
 */
export function SidebarComponent() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="hidden md:flex">
      {/* Sidebar Header with branding */}
      <SidebarHeader className="h-10 flex items-center border-b">
        <div className="flex items-end justify-end">
          <span className="font-bold text-lg">Baddie Borsch</span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content with navigation menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Determine if this item is active based on current URL
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3",
                          // Apply different styles based on active state
                          isActive
                            ? "bg-pink-600 hover:bg-pink-600"
                            : "hover:bg-stone-100"
                        )}
                      >
                        {/* Icon with conditional styling */}
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-white" : "text-muted-foreground"
                          )}
                        />
                        {/* Text with conditional styling */}
                        <span
                          className={cn(
                            isActive ? "text-white" : "text-muted-foreground"
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with copyright info */}
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition cursor-pointer">
            {/* Placeholder for logout button */}
            {/* <LogOut className="h-4 w-4" /> */}
            {/* <span>Logout</span> */}
          </div>
          <div className="text-xs text-muted-foreground">
            © 2025 Baddie Bosch
            <br />
            All rights reserved.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
