/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteMenu } from "../site-menu";
import { SITE_PAGE_GROUPS, type SitePage } from "@/lib/site-pages";
import { MENU_CLOSE_THREADS, MENU_LINK_THREADS } from "@/components/ui/solini-mark";

jest.mock("next/navigation", () => ({ usePathname: () => "/about" }));

/** The list stays mounted so it can fold away; closed, it is inert. */
function expectClosed() {
  const list = screen.getByRole("navigation", { name: "Site", hidden: true });
  expect(list).toHaveAttribute("data-open", "false");
  expect(list).toHaveAttribute("inert");
}

function expectOpen() {
  const list = screen.getByRole("navigation", { name: "Site" });
  expect(list).toHaveAttribute("data-open", "true");
  expect(list).not.toHaveAttribute("inert");
}

describe("SiteMenu", () => {
  it("is closed until the Menu button is pressed", () => {
    render(<SiteMenu />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expectClosed();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expectOpen();
  });

  it("wears the woven flame, decorative, with all twelve threads", () => {
    const { container } = render(<SiteMenu />);
    const icon = container.querySelector("svg.menu-flame");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.querySelectorAll(".menu-thread")).toHaveLength(12);
    expect(icon?.querySelectorAll(".menu-thread.fill-gold-deep")).toHaveLength(1);
  });

  it("has a thread from the flame for every link to fly in as its underline", () => {
    const { container } = render(<SiteMenu />);
    const links = SITE_PAGE_GROUPS.flatMap((group): readonly SitePage[] => group.pages);
    expect(MENU_LINK_THREADS).toHaveLength(links.length);
    // None of them is a thread of the close mark
    for (const thread of MENU_LINK_THREADS) expect(MENU_CLOSE_THREADS).not.toContain(thread);
    expect(container.querySelectorAll(".menu-underline")).toHaveLength(links.length);
    // The current page's underline carries the "now" gold
    expect(container.querySelectorAll(".menu-underline.bg-gold-deep")).toHaveLength(1);
  });

  it("staggers its lines in order, top to bottom", () => {
    const { container } = render(<SiteMenu />);
    const steps = [...container.querySelectorAll<HTMLElement>(".menu-item")].map((el) => el.style.getPropertyValue("--i"));
    expect(steps).toEqual(steps.map((_, i) => String(i)));
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
    expectClosed();
    expect(button).toHaveFocus();
  });

  it("closes on a tap outside it", () => {
    render(<SiteMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.pointerDown(document.body);
    expectClosed();
  });
});
