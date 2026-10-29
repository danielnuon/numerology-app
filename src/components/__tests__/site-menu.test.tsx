/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteMenu } from "../site-menu";
import { SITE_PAGE_GROUPS, type SitePage } from "@/lib/site-pages";

jest.mock("next/navigation", () => ({ usePathname: () => "/about" }));

describe("SiteMenu", () => {
  it("is closed until the Menu button is pressed", () => {
    render(<SiteMenu />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Site" })).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Site" })).toBeInTheDocument();
  });

  it("lists every page and marks the current one", () => {
    render(<SiteMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    for (const page of SITE_PAGE_GROUPS.flatMap((group): readonly SitePage[] => group.pages)) {
      expect(screen.getByRole("link", { name: page.label })).toHaveAttribute("href", page.href);
    }
    expect(screen.getByRole("link", { name: "About Solini" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Our heritage" })).not.toHaveAttribute("aria-current");
  });

  it("closes on Escape and returns focus to the button", () => {
    render(<SiteMenu />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Site" })).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it("closes on a tap outside it", () => {
    render(<SiteMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("navigation", { name: "Site" })).not.toBeInTheDocument();
  });
});
