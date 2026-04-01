"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CircleUser,
  Calendar,
  ClipboardList,
  ChartBarStacked,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import SignOutBtn from "@/components/navigation/signout-btn";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpen, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const BREAKPOINT = 768;
    let prevWasNarrow = window.innerWidth < BREAKPOINT;

    const handleResize = () => {
      const isNarrow = window.innerWidth < BREAKPOINT;
      if (isNarrow !== prevWasNarrow) {
        if (!isNarrow) setOpen(true);
        prevWasNarrow = isNarrow;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );

    const fetchUserData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!user) return;

      setEmail(user.email ?? null);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setUsername(profile?.username ?? null);
    };

    fetchUserData();
  }, []);

  const menuItems = [
    { href: "/modules/calendar", label: "Calendar", icon: Calendar },
    { href: "/modules/tasks", label: "Tasks", icon: ClipboardList },
    { href: "/modules/categories", label: "Categories", icon: ChartBarStacked },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-[#121212] flex flex-row justify-start items-center gap-2">
        <Image
          src="/icons/app-icon.png"
          alt="Brand Icon"
          width={48}
          height={48}
          loading="eager"
        />
        <p className="font-semibold text-white">WhatDayIsIt?</p>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-[#121212] flex flex-col group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-0 transition-all duration-200 ease-in-out">
        <div className="flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2 pb-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center h-9 w-9 rounded-md text-gray-400 hover:text-black hover:bg-white transition-all duration-200 ease-in-out shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.href}
              className="flex flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center"
            >
              <TooltipProvider>
                <Tooltip key={`${item.href}-${isCollapsed}`}>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className="border border-transparent py-5 px-4 data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:border data-[active=true]:border-(--primary-blue)/20 hover:bg-white hover:text-black hover:border hover:border-white/20 active:bg-white active:text-black focus:bg-white focus-visible:bg-transparent focus-visible:ring-0 transition-all duration-200 ease-in-out"
                    >
                      <Link
                        href={item.href}
                        className="font-semibold text-gray-400 flex items-center gap-2"
                      >
                        <item.icon className="shrink-0" />
                        <span className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>

                  {isCollapsed && (
                    <TooltipContent
                      side="right"
                      sideOffset={8}
                      className="bg-[#14171F] border border-gray-700 text-gray-300 text-xs"
                    >
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-[#121212]">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-2 py-3 group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    <CircleUser size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {username ?? "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {email ?? "User Email"}
                  </p>
                </div>
              </div>
              <div className="group-data-[collapsible=icon]:hidden shrink-0">
                <SignOutBtn />
              </div>

              <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          <CircleUser size={20} />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={8}
                      className="bg-[#14171F] border border-gray-700 text-gray-300 text-xs"
                    >
                      <p className="font-semibold text-white">
                        {username ?? "User"}
                      </p>
                      <p className="text-gray-500">{email ?? ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <SignOutBtn />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
