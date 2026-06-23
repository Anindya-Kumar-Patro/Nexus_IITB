import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { VentureForm } from "@/components/venture-form";
import { createClient } from "@/lib/supabase/server";
import { updateVenture, type VentureState } from "@/actions/ventures";
import type { Venture } from "@/types/database";

export default async function EditVenturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: venture } = await supabase.from("ventures").select("*").eq("id", id).single();
  if (!venture) notFound();
  const v = venture as Venture;
  if (v.owner_id !== user?.id) redirect(`/ventures/${id}`);

  // Bind the venture id into the update action.
  const action = async (prev: VentureState, fd: FormData) => {
    "use server";
    return updateVenture(id, prev, fd);
  };

  return (
    <div className="max-w-2xl">
      <Topbar title="Edit venture" />
      <div className="rounded-xl border border-line bg-white p-6">
        <VentureForm action={action} venture={v} submitLabel="Save changes" />
      </div>
    </div>
  );
}
