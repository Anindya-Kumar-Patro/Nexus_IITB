import { redirect } from "next/navigation";

// Auth + profile gating happens in middleware; just send people to the feed.
export default function Root() {
  redirect("/feed");
}
