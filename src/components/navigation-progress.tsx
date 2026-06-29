// @ts-nocheck
"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <ProgressBar
      height="3px"
      color="#6d28d9"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
