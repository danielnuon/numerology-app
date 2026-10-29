import { ViewTransition } from "react";

/**
 * Every route change is a transition: the page being left fades out quickly
 * and the new page rises into place (`fade-out` and `rise-in` in
 * globals.css). A template remounts on each navigation, which is what lets
 * the old page exit and the new one enter. Named elements inside a page keep
 * their own transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="rise-in" exit="fade-out" default="none">
      {children}
    </ViewTransition>
  );
}
