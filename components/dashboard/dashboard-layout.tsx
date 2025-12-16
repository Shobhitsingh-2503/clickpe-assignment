"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import {
  ActivityIcon,
  Home,
  LoaderPinwheel,
  Paperclip,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState("");
  const pathname = usePathname();

  const getUser = async () => {
    const userEmail = user?.email;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail);

    if (error) {
      console.log(error);
    }

    if (data) {
      setUserName(data[0].display_name);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  return (
    <SidebarProvider>
      <Sidebar className="bg-white">
        <SidebarHeader className="bg-gray-100">
          <div className="text-center font-bold text-md p-1">
            CreditFlow Advisor
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupLabel>Assignment</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    tooltip="Home"
                    className={`${
                      pathname === "/dashboard" ? "bg-gray-100" : ""
                    }`}
                  >
                    <Link href="/dashboard">
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/all"}
                    tooltip="All Products"
                    className={`${
                      pathname === "/dashboard/all" ? "bg-gray-100" : ""
                    }`}
                  >
                    <Link href="/dashboard/all">
                      <LoaderPinwheel className="h-5 w-5" />
                      <span>All Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>About Me</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/about"}
                    tooltip="Resume"
                    className={`${
                      pathname === "/dashboard/about" ? "bg-gray-100" : ""
                    }`}
                  >
                    <Link href="/dashboard/about">
                      <Paperclip className="h-5 w-5" />
                      <span>Resume</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/contact"}
                    tooltip="Contact"
                  >
                    <Link href="/dashboard/contact">
                      <User className="h-5 w-5" />
                      <span>Contact me</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-white">
          <div className="flex items-center gap-2 justify-center w-full border rounded-md p-2">
            <User className="h-4 w-4" />
            {userName}
          </div>
          <Button
            onClick={signOut}
            className="w-full bg-red-400 text-white border border-red-500 hover:bg-red-500 hover:text-white hover:cursor-pointer "
          >
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="bg-gray-100 p-2">
          <SidebarTrigger className="h-8 w-8" />
        </div>
        <main className="p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
