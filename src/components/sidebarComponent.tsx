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

import { Calendar, Home, Table2 } from "lucide-react";

// Menu items.
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

export function SidebarComponent() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="hidden md:flex">
      <SidebarHeader className="h-10 flex items-center  border-b">
        <div className="flex items-end justify-end">
          <span className="font-bold text-lg">Baddie Bosch</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
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
                          isActive
                            ? "bg-pink-600 hover:bg-pink-700"
                            : "hover:bg-stone-100"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-white" : "text-muted-foreground"
                          )}
                        />
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

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition cursor-pointer">
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
