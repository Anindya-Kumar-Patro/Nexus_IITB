// @ts-nocheck
import { redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { VentureForm } from "@/components/venture-form";
import { createVenture } from "@/actions/ventures";
import { createClient } from "@/lib/supabase/server";
import { Lightbulb, Users, Target, Rocket } from "lucide-react";

export default async function NewVenturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/feed");

  return (
    <div>
      <Topbar title="Post a venture" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px] lg:items-start">

        <div className="rounded-xl border border-line bg-white p-6">
          <VentureForm action={createVenture} submitLabel="Post venture" />
        </div>

        <div className="flex flex-col gap-4">

          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-ink">Tips for a great post</p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Lightbulb size={15} />
                </div>
                <div>
                  <p className="text-xs font-medium text-ink">Be specific</p>
                  <p className="text-xs text-ink-3">Vague ideas get ignored. Name the problem, not just the domain.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Users size={15} />
                </div>
                <div>
                  <p className="text-xs font-medium text-ink">Say who you need</p>
                  <p className="text-xs text-ink-3">List exact roles. "Tech lead" is clearer than "developer".</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Target size={15} />
                </div>
                <div>
                  <p className="text-xs font-medium text-ink">Share where you are</p>
                  <p className="text-xs text-ink-3">Brainstorming or MVP? People apply differently at each stage.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Rocket size={15} />
                </div>
                <div>
                  <p className="text-xs font-medium text-ink">Hook them fast</p>
                  <p className="text-xs text-ink-3">Your one-liner is what people see first. Make it count.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-2 text-sm font-semibold text-ink">What happens next?</p>
            <div className="flex flex-col gap-2 text-xs text-ink-3">
              <p>1. Your venture appears on the feed immediately</p>
              <p>2. Interested students apply with a message</p>
              <p>3. You review their profile and accept or reject</p>
              <p>4. Accepted applicants unlock a direct chat with you</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
