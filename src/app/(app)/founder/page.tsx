// @ts-nocheck
import { Topbar } from "@/components/topbar";
import { Linkedin, Instagram, Mail } from "lucide-react";

export default function FounderPage() {
  return (
    <div className="max-w-2xl">
      <Topbar title="About the Founder" />

      <div className="rounded-xl border border-line bg-white p-7">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
            AP
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Anindya Kumar Patro</h2>
            <p className="mt-1 text-sm text-ink-3">MBA · SJMSOM, IIT Bombay</p>
            <p className="mt-1 text-xs text-ink-3">Roll No. 25M2362 · Batch of 2025</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink">
          Anindya is an MBA student at Shailesh J. Mehta School of Management (SJMSOM), IIT Bombay.
          Nexus was born out of a simple observation — brilliant people at IIT Bombay often cannot
          find each other to build things together.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink">
          As someone at the intersection of management and technology, Anindya built Nexus to bridge
          the gap between founders with ideas and builders with skills — right here on campus.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          <a
            href="https://www.linkedin.com/in/anindya-kumar-patro/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
          <a
            href="https://www.instagram.com/anindya_kumar_patro"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
          >
            <Instagram size={16} /> Instagram
          </a>
          <a
            href="mailto:25m2362@iitb.ac.in"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-brand-200 hover:bg-brand-50"
          >
            <Mail size={16} /> Email
          </a>
        </div>
      </div>
    </div>
  );
}