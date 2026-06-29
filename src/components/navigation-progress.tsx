// @ts-nocheck
"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <ProgressBar
      height="4px"
      color="#a78bfa"
      options={{ showSpinner: false, trickleSpeed: 200 }}
      shallowRouting
      style="z-index: 99999; position: fixed; top: 0; left: 0;"
    />
  );
}
