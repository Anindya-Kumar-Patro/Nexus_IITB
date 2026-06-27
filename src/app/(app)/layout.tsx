// @ts-nocheck
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let name = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    name = data?.full_name ?? null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar name={name} isAuthed={!!user} userId={user?.id} />
      <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 pt-16 pb-20 lg:px-7 lg:pt-7 lg:pb-7">
        {children}
      </main>
    </div>
  );
}
