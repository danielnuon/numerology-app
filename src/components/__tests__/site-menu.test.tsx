/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteMenu } from "../site-menu";
import { SITE_PAGE_GROUPS, type SitePage } from "@/lib/site-pages";

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
