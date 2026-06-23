// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "@/components/notification-bell";

export async function Topbar({ title }: { title: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mb-6 flex items-center gap-4">
      <h1 className="flex-1 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {user && <NotificationBell userId={user.id} />}
    </div>
  );
}
