// @ts-nocheck
import { Topbar } from "@/components/topbar";
import { Mail, Rocket, Users, MessageCircle, Bookmark, Search } from "lucide-react";

const FEATURES = [
  { icon: Rocket, title: "Post ventures", desc: "Share your idea with the campus" },
  { icon: Users, title: "Find co-founders", desc: "Connect with the right people" },
  { icon: Search, title: "Discover talent", desc: "Browse by skill and department" },
  { icon: MessageCircle, title: "Chat directly", desc: "Realtime messaging built in" },
  { icon: Bookmark, title: "Save ideas", desc: "Bookmark ventures you love" },
];

export default function AboutPage() {
  return (
    <div>
      <Topbar title="About" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ alignItems: "stretch" }}>

        {/* LEFT — About Nexus */}
        <div style={{ display: "flex", flexDirection: "column" }}
          className="rounded-xl border border-line bg-white p-7">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
              N
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Nexus IITB</h2>
              <p className="text-xs text-ink-3">The startup network for IIT Bombay</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ink">
            I built Nexus because I kept seeing the same problem around me. People at IITB with incredible ideas
            who could not find the right people to build with. A CS student with a fintech idea looking for someone
            who understands business. A designer with a product vision needing a developer. Everyone operating in
            their own circles, missing each other.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink">
            Nexus is my attempt to fix that. It is a private platform locked to IITB email addresses, where
            students and faculty can post venture ideas, find co-founders, apply to join early-stage startups,
            and talk to each other directly, all in one place.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-2 rounded-lg border border-line p-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <f.icon size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight text-ink">{f.title}</p>
                  <p className="text-[11px] text-ink-3">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* spacer pushes restriction note to bottom */}
          <div style={{ flex: 1, minHeight: "24px" }} />

          <div className="rounded-lg bg-brand-50 px-4 py-3">
            <p className="text-xs text-ink-3">
              Restricted to{" "}
              <span className="font-medium text-brand-800">@iitb.ac.in</span>{" "}
              email addresses only.
            </p>
          </div>

        </div>

        {/* RIGHT — About Founder */}
        <div style={{ display: "flex", flexDirection: "column" }}
          className="rounded-xl border border-line bg-white p-7">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              AP
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Anindya Kumar Patro</h2>
              <p className="text-xs text-ink-3">MBA · SJMSOM, IIT Bombay · 25M2362</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ink">
            I am an MBA student at SJMSOM, IIT Bombay, and I built Nexus from scratch. Design, backend,
            frontend, everything. No team, no funding, just a problem I genuinely wanted to solve for
            the campus I am part of.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink">
            I come from a background that sits at the intersection of management and technology, which
            is exactly why I felt this gap so personally. I wanted to build something that would outlast
            my time here. A permanent layer of infrastructure for every IITB student who has an idea
            and needs the right person to build it with.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink">
            If you have feedback, want to collaborate, or just want to say hi, I would love to hear
            from you. Nexus is for this community and I want to keep making it better for it.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-ink">
            Building Nexus has been one of the most fulfilling things I have done at IIT Bombay.
            Every feature you see here was designed with one question in mind. What would actually
            make it easier for two people on this campus to find each other and build something great?
          </p>

          {/* spacer pushes contact buttons to bottom */}
          <div style={{ flex: 1, minHeight: "24px" }} />

          <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            <a
              href="https://www.linkedin.com/in/anindya-kumar-patro/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/anindya_kumar_patro"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              Instagram
            </a>
            <a
              href="mailto:25m2362@iitb.ac.in"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition hover:border-brand-200 hover:bg-brand-50"
            >
              <Mail size={14} /> Email me
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}