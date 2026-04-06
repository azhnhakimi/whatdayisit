"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  category?: Category | null;
  onDone?: () => void;
};

const CategoryCreationDrawer = ({ open, setOpen, category, onDone }: Props) => {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#A8D5BA");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    } else {
      setName("");
      setColor("#A8D5BA");
    }
  }, [category, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (category) {
      await supabase
        .from("categories")
        .update({ name, color })
        .eq("id", category.id);
    } else {
      await supabase.from("categories").insert({
        name,
        color,
        user_id: user.id,
      });
    }

    setLoading(false);
    setOpen(false);
    onDone?.();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerContent className="p-6">
        <DrawerHeader>
          <DrawerTitle>
            {category ? "Edit Category" : "Create Category"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-14 h-10 p-1"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        </div>

        <DrawerFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? category
                ? "Saving..."
                : "Creating..."
              : category
                ? "Save"
                : "Create"}
          </Button>

          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryCreationDrawer;
