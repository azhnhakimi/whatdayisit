"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleSignOut()}
            className="flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-[#D93E3F] hover:bg-[#D93E3F]/10 transition-colors hover:cursor-pointer"
          >
            <LogOut size={17} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="bg-[#14171F] border border-gray-700 text-gray-300 text-xs before:hidden after:hidden"
        >
          Logout
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
