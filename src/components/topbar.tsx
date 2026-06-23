// @ts-nocheck
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "@/components/notification-bell";

export async function Topbar({ title }: { title: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mb-6 flex items-center gap-4">
      <h1 className="flex-1 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {user && <NotificationBell userId={user.id} />}
      <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink-3 sm:flex">
        <Search size={16} />
        <span>Search ventures, people...</span>
      </div>
    </div>
  );
}
