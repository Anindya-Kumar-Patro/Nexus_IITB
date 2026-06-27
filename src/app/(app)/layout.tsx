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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar name={name} isAuthed={!!user} userId={user?.id} />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "28px" }}
        className="pt-16 pb-20 px-4 lg:pt-7 lg:pb-7 lg:px-7">
        {children}
      </main>
    </div>
  );
}
