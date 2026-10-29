/**
 * Life Area Data
 *
 * What each of the twelve life areas covers, and how each luck tier reads in
 * that area. Keyed by 1-indexed column like LIFE_AREA_MAP. Kept apart from
 * the logic for future i18n.
 *
 * A year is read as its area and its number together: the number says how
 * strong the year is, the area says what that strength applies to. This
 * follows the Thai and Khmer seven-number charts this system descends from,
 * where every prediction is for a value in a particular house. See
 * docs/reading-model.md for the sources and what is still open.
 */

import type { YearTier } from "./interpretation-data";

/** What part of life each column speaks to, not what will happen in it. */
export const LIFE_AREA_DESCRIPTIONS: Record<number, string> = {
  1: "Your confidence, your outlook and the direction you set for yourself.",
  2: "Parents, siblings and the people you grew up with.",
  3: "Travel, moving house and changes of work or place.",
  4: "The place you live, your household and your land.",
  5: "What you earn, save and spend.",
  6: "Friends, colleagues and the people who help you along.",
  7: "Partners, marriage and your closest bonds.",
  8: "Your body, your energy and how well you rest.",
  9: "Your reputation and your standing at work and in the community.",
  10: "Openings, good timing and new chances.",
  11: "What comes back from past actions, and the merit you make.",
  12: "What shelters you, from elders and faith to the care you take.",
};

/**
 * The reading for each life area at each tier. Every area is a part of life
 * people hope goes well, so a higher tier always reads as better for that
 * area, and zero reads as that area changing shape.
 */
export const AREA_READINGS: Record<number, Record<YearTier, string>> = {
  1: {
    zero: "Your sense of direction is turning over. Old ways of seeing yourself loosen before new ones settle.",
    weak: "Confidence may run lower than usual. Small promises kept to yourself count for more than big declarations.",
    moderate: "Your outlook is even. A year to keep your own course and adjust it gently.",
    strong: "A year read as well supported for confidence and direction. A good time to make choices for yourself.",
    "very-strong": "One of your strongest years as a person, read as the time to set the direction you want for the years ahead.",
  },
  2: {
    zero: "A turning point in family life. Roles at home or between generations may be shifting.",
    weak: "Family ties ask for more patience this year. Small kindnesses and plain talk go further than big gestures.",
    moderate: "Family life holds steady, with its ordinary ups and downs.",
    strong: "A warm year for family, and a good time to spend with parents and siblings.",
    "very-strong": "A peak year for family bonds, and a good time to gather, reconcile or celebrate together.",
  },
  3: {
    zero: "Travel, moves and changes of work are unsettled. Plans may change shape before they land.",
    weak: "Not the strongest year to move house or change jobs. If a move is needed, prepare it carefully.",
    moderate: "Changes of place or work come with neither a push nor a pull. Moves made with care tend to work out.",
    strong: "A year read as favoring travel and change. A good time to weigh the trip or the move you have in mind.",
    "very-strong": "A peak year for movement. Journeys, moves and new work are read as especially well timed.",
  },
  4: {
    zero: "Your household or living place is in transition. Things at home may be rearranged.",
    weak: "Home asks for upkeep rather than expansion. Look after what you have before taking on more.",
    moderate: "Home life is steady. A year for small improvements rather than big projects.",
    strong: "A good year for home and land, and a fine time to settle in, repair or improve where you live.",
    "very-strong": "A peak year for home, read as well timed for building, settling or putting down roots.",
  },
  5: {
    zero: "Money is unsettled. Income or spending may shift, so keep something in reserve.",
    weak: "A leaner year for money. Saving and careful spending serve you better than new risks.",
    moderate: "Money comes and goes evenly. A year for budgeting and steady saving.",
    strong: "A year read as favorable for earning. A good time to put effort into work and income.",
    "very-strong": "A peak year for money in the tradition, a time to build up savings and plan ahead.",
  },
  6: {
    zero: "Your circle is changing. Some ties may loosen as new ones form.",
    weak: "Help from others may be harder to find. Lean on the few people you trust most.",
    moderate: "Friends and colleagues are steady. Help you give tends to come back.",
    strong: "A good year for allies, and a fine time to ask for help or offer it.",
    "very-strong": "A peak year for friendship and support, read as a time to seek out mentors and collaborators.",
  },
  7: {
    zero: "Your closest bonds are at a turning point. A relationship may change form or begin anew.",
    weak: "Partnerships ask for patience and care. Listening more and assuming less helps.",
    moderate: "Close relationships are steady, neither strained nor especially lifted.",
    strong: "A warm year for partners and close bonds, read as a good time for commitments.",
    "very-strong": "A peak year for love and partnership, read as a favored time to marry or deepen a bond.",
  },
  8: {
    zero: "Your energy is unsettled. Rest and routine help you through changes in how you feel.",
    weak: "A year to look after your body more closely. Rest, steady habits and checkups matter more than usual.",
    moderate: "Health and energy are steady. Keep up the habits that serve you.",
    strong: "A year of good energy, and a good time to build habits that keep you well.",
    "very-strong": "A peak year for vitality in the tradition, a time to enjoy your energy and keep it well tended.",
  },
  9: {
    zero: "Your standing is in flux. Roles or recognition may change hands.",
    weak: "Recognition may come slowly. Steady, quiet work protects your name better than seeking attention.",
    moderate: "Your reputation holds steady. Good work is noticed in the ordinary way.",
    strong: "A year read as favorable for reputation. A good time to let your work be seen.",
    "very-strong": "A peak year for standing, read as a time to step into a larger role at work or in your community.",
  },
  10: {
    zero: "Openings are unclear. Let things settle before you choose.",
    weak: "Fewer doors open this year. Prepare, so you are ready when the timing improves.",
    moderate: "Chances come at an ordinary pace. Weigh each one on its merits.",
    strong: "A year read as well timed. Openings that appear are worth taking seriously.",
    "very-strong": "A peak year for opportunity, read as a rare time to reach for the chances you want.",
  },
  11: {
    zero: "Old matters are closing. A good time to settle what is unfinished.",
    weak: "Past actions may weigh more heavily. Making merit and mending what you can is the traditional answer.",
    moderate: "What you give and what comes back are in balance.",
    strong: "A year read as returning the good you have done. A fruitful time to make merit.",
    "very-strong": "A peak year for merit, read as a time when past kindness is returned.",
  },
  12: {
    zero: "What shelters you is shifting. Stay close to elders, faith and the routines that steady you.",
    weak: "You may feel less shielded this year. Take extra care, and lean on elders and faith.",
    moderate: "The shelter around you is steady.",
    strong: "A year read as well sheltered. A good time to draw on elders, faith and good habits.",
    "very-strong": "A peak year for protection, read as a time of strong support from elders and faith.",
  },
};
