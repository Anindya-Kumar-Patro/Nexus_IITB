import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let name: string | null = null;
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
      <main className="flex-1 px-7 py-7">{children}</main>
    </div>
  );
}
