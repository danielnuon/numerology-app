/**
 * Life Area Data
 *
 * What each of the twelve life areas covers, keyed by 1-indexed column like
 * LIFE_AREA_MAP. These say what part of life a year's number speaks to, not
 * what will happen in it. Kept apart from the logic for future i18n.
 */

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
