// @ts-nocheck
import { redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { VentureForm } from "@/components/venture-form";
import { createVenture } from "@/actions/ventures";
import { createClient } from "@/lib/supabase/server";

export default async function NewVenturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/feed");

  return (
    <div className="max-w-2xl">
      <Topbar title="Post a venture" />
      <div className="rounded-xl border border-line bg-white p-6">
        <VentureForm action={createVenture} submitLabel="Post venture" />
      </div>
    </div>
  );
}