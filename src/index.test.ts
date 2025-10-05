import { test, expect } from "bun:test";
import { completedLevelsScore } from "./index";

test("completedLevelsScore - levels 0 through 7", () => {
  expect(completedLevelsScore(0)).toBe(0);
  expect(completedLevelsScore(1)).toBe(2);
  expect(completedLevelsScore(2)).toBe(6);
  expect(completedLevelsScore(3)).toBe(12);
  expect(completedLevelsScore(4)).toBe(20);
  expect(completedLevelsScore(5)).toBe(32);
  expect(completedLevelsScore(6)).toBe(48);
  expect(completedLevelsScore(7)).toBe(68);
});
