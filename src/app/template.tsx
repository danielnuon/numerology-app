import { ViewTransition } from "react";

/**
 * Every route change is a transition: the page being left fades out quickly
 * and the new one fades in (`fade-out` and `page-in` in globals.css) while
 * its parts arrive in their own order and the woven flame travels from the
 * old page to the new (FlameAnchor). A template remounts on each navigation,
 * which is what lets the old page exit and the new one enter. Named elements
 * inside a page keep their own transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="fade-out" default="none">
      {children}
    </ViewTransition>
  );
}
