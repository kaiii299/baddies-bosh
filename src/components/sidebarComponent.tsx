"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Calendar,
  File,
  Home,
  Settings,
  Settings2,
  Table2,
  UserRound,
} from "lucide-react";

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
    title: "Table",
    url: "/tools",
    icon: Table2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserRound,
  },
];

export function SidebarComponent() {
  const pathname = usePathname();

  return (
    <Sidebar 
      collapsible="offcanvas" 
      className="hidden md:flex"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || 
                               (item.url !== "/" && pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3",
                          isActive && "bg-pink-600 py-3 hover:bg-pink-600"
                        )}
                      >
                        <item.icon className={cn(
                          "h-4 w-4",
                          isActive ? "text-white" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          isActive ? "text-white" : "text-muted-foreground"
                        )}>
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
    </Sidebar>
  );
}
