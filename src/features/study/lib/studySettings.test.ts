import { cleanStudySettings, DEFAULT_STUDY_SETTINGS } from "./studySettings";

describe("cleanStudySettings", () => {
  it("keeps valid settings", () => {
    const valid = { newItemsPerDay: 20, maxReviewsPerSession: 100, showHardEasy: true };
    expect(cleanStudySettings(valid)).toEqual(valid);
  });

  it("uses the defaults for missing, broken or non-object input", () => {
    expect(cleanStudySettings({})).toEqual(DEFAULT_STUDY_SETTINGS);
    expect(cleanStudySettings(null)).toEqual(DEFAULT_STUDY_SETTINGS);
    expect(cleanStudySettings("text")).toEqual(DEFAULT_STUDY_SETTINGS);
    const broken = { newItemsPerDay: "5", maxReviewsPerSession: NaN, showHardEasy: "yes" };
    expect(cleanStudySettings(broken)).toEqual(DEFAULT_STUDY_SETTINGS);
  });

  it("moves numbers into range and rounds decimals", () => {
    expect(cleanStudySettings({ newItemsPerDay: -3 }).newItemsPerDay).toBe(0);
    expect(cleanStudySettings({ newItemsPerDay: 999 }).newItemsPerDay).toBe(50);
    expect(cleanStudySettings({ newItemsPerDay: 7.6 }).newItemsPerDay).toBe(8);
    expect(cleanStudySettings({ maxReviewsPerSession: 1 }).maxReviewsPerSession).toBe(10);
    expect(cleanStudySettings({ maxReviewsPerSession: 9999 }).maxReviewsPerSession).toBe(500);
  });
});
