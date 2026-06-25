// @ts-nocheck
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children, params }) {
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
    <div className="flex min-h-screen">
      <Sidebar name={name} isAuthed={!!user} userId={user?.id} />
      <div className="flex flex-1 min-w-0 flex-col">
        <main className="flex-1 px-4 py-4 pt-16 pb-4 lg:px-7 lg:py-7 lg:pt-7">
          {children}
        </main>
        <div className="px-4 pb-24 lg:px-7 lg:pb-7">
          <Footer />
        </div>
      </div>
    </div>
  );
}