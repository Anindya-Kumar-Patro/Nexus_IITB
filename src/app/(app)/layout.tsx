// @ts-nocheck
import { Sidebar } from "@/components/sidebar";
import { FooterConditional } from "@/components/footer";
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
      <div className="flex flex-1 min-w-0 flex-col h-full overflow-y-auto">
        <main className="flex-1 px-4 py-4 pt-16 pb-4 lg:px-7 lg:py-7 lg:pt-7">
          {children}
        </main>
        <FooterConditional />
      </div>
    </div>
  );
}
