/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BirthReading } from "../birth-reading";

describe("BirthReading", () => {
  // Worked example: born 1997-07-24, a Thursday in the year of the Ox
  it("reads the birth day: Khmer name, planet strength, character and color", () => {
    render(<BirthReading weekday={5} animal="Ox" />);
    const day = screen.getByRole("region", { name: "Born on a Thursday" });
    expect(day).toHaveTextContent("ថ្ងៃព្រហស្បតិ៍ · Thngai Prohoah");
    expect(day).toHaveTextContent("Jupiter, strength 19 of 21 in the Khmer count");
    expect(day).toHaveTextContent(/royal teacher/);
    expect(day).toHaveTextContent("Dark green, worn for hope");
    expect(screen.getByRole("link", { name: "Where this comes from" })).toHaveAttribute("href", "/meaning#birth-day");
  });

  it("reads the animal and labels its traits as the popular reading", () => {
    render(<BirthReading weekday={5} animal="Ox" />);
    const animal = screen.getByRole("region", { name: "Year of the Ox" });
    expect(animal).toHaveTextContent("ឆ្នាំឆ្លូវ · Chhnam Chhlov");
    expect(animal).toHaveTextContent("Popular reading: read as patient and hardworking");
    expect(animal).toHaveTextContent(/not drawn from a Khmer text/);
    expect(screen.getByRole("link", { name: "How Cambodians read the animal" })).toHaveAttribute(
      "href",
      "/meaning#zodiac-animal",
    );
  });

  it("names the Sun as the birth day's planet with a capital letter", () => {
    render(<BirthReading weekday={1} animal="Rat" />);
    expect(screen.getByRole("region", { name: "Born on a Sunday" })).toHaveTextContent("The Sun, strength 6 of 21");
  });
});
