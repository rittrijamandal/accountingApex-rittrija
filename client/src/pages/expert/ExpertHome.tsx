import { Link } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { prettifyWelcomeFirstName } from "@/lib/utils";
import { Hammer, ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";

export default function ExpertHome() {
  const { profile, loading: authLoading } = useAuth();

  const displayName = prettifyWelcomeFirstName(profile);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AppShell sidebar={false}>
      {/* Header */}
      <div className="px-8 pt-8 pb-2">
        <div className="label-eyebrow">Expert Workspace</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">
          Welcome back, <em className="text-indigo-700">{displayName}</em>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Author benchmark worlds or review submissions from your peers.
        </p>
      </div>

      {/* Workflow cards */}
      <div className="px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
          {[
            {
              to: "/expert/builder",
              icon: Hammer,
              eyebrow: "Authoring",
              title: "Create a World",
              desc: "Define a business scenario, upload the data room, write the agent task prompt, and design the grading rubric.",
              cta: "Start authoring",
            },
            {
              to: "/expert/review-queue",
              icon: ClipboardCheck,
              eyebrow: "Peer Review",
              title: "Review Worlds",
              desc: "Score worlds submitted by other experts. Three independent reviewers must score each world before approval.",
              cta: "Open review queue",
            },
          ].map((c) => (
            <Link key={c.to} to={c.to}>
              <div className="group rounded-3xl bg-white p-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-indigo-700" />
                </div>
                <div className="mt-7 label-eyebrow">{c.eyebrow}</div>
                <div className="mt-2 font-serif-display text-3xl text-slate-900 tracking-tight">{c.title}</div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                <div className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-slate-900 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider group-hover:bg-indigo-700 transition">
                  {c.cta} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
