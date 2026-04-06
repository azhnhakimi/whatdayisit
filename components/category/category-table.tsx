"use client";

import { useState } from "react";
import { Pencil, Trash, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import CategoryCreationDrawer from "@/components/drawer/category-creation-drawer";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = {
  id: string;
  name: string;
  color: string;
};

const CategoryTable = ({ initialData }: { initialData: Category[] }) => {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [selected, setSelected] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCategories(data);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setSelected(null);
          setOpen(true);
        }}
        className="flex items-center gap-1.5 px-5 py-2 bg-[#121212] text-[#f9f9f7] rounded-md text-xs font-medium hover:bg-[#1a1a1a] hover:cursor-pointer"
      >
        <Plus size={16} />
        New Category
      </button>

      <Table className="w-full max-w-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Colour</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>No categories yet.</TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.color}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelected(category);
                        setOpen(true);
                      }}
                      className="bg-[#121212] text-white rounded-md p-2 aspect-square hover:bg-[#121212]/80"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-[#121212] text-white rounded-md p-2 aspect-square hover:bg-[#121212]/80"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CategoryCreationDrawer
        open={open}
        setOpen={setOpen}
        category={selected}
        onDone={() => {
          setSelected(null);
          setOpen(false);
          refresh();
        }}
      />
    </div>
  );
};

export default CategoryTable;
