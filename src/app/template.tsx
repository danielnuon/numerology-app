import { ViewTransition } from "react";

/**
 * Every route change is a transition: the page being left fades out quickly
 * and the new page rises into place (`page-exit` and `page-enter` in
 * globals.css). A template remounts on each navigation, which is what lets
 * the old page exit and the new one enter. Named elements inside a page keep
 * their own transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
