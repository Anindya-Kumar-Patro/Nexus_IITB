// @ts-nocheck
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { Rocket, Users, MessageCircle, Bookmark, Search } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <Topbar title="About Nexus" />

      <div className="rounded-xl border border-line bg-white p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">N</div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Nexus IITB</h2>
            <p className="text-sm text-ink-3">The startup network for IIT Bombay</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink">
          Nexus is a private startup ecosystem platform exclusively for the IIT Bombay campus community.
          Think of it as LinkedIn meets a startup bulletin board — but locked to IITB.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink">
          The core problem it solves: a brilliant CS student with a startup idea has no easy way to find
          a management co-founder, or a design student with a product vision cannot find a developer —
          unless they happen to know each other personally. Nexus fixes that.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Rocket, title: "Post ventures", desc: "Share your startup idea with the IITB community" },
            { icon: Users, title: "Find co-founders", desc: "Connect with builders, designers, and managers" },
            { icon: Search, title: "Discover talent", desc: "Browse students by skill, department, and role" },
            { icon: MessageCircle, title: "Chat securely", desc: "Realtime messaging with accepted collaborators" },
            { icon: Bookmark, title: "Save ideas", desc: "Bookmark ventures you want to revisit" },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 rounded-lg border border-line p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{f.title}</p>
                <p className="text-xs text-ink-3">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="text-xs text-ink-3">
            Nexus is restricted to <span className="font-medium text-ink">@iitb.ac.in</span> email addresses.
            Only current students and faculty can sign up.
          </p>
        </div>
      </div>
    </div>
  );
}