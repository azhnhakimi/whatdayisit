import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import CategoryTable from "@/components/category/category-table";

export const metadata: Metadata = {
  title: "Categories",
};

const CategoriesPage = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 w-full h-full min-h-screen flex-1 space-y-6">
      <p className="text-black font-semibold text-4xl">Categories</p>
      <CategoryTable initialData={categories ?? []} />
    </div>
  );
};

export default CategoriesPage;
