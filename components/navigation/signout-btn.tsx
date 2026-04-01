"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Sign Out
    </button>
  );
}
