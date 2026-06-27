import assert from "node:assert/strict";
import test from "node:test";
import { mergeAiFields } from "./useSheet.js";

test("mergeAiFields appends new problem details to selected row without requiring aircraft", () => {
  const existing = {
    ac: "8742",
    gate: "C72",
    problem: "Lav door will not latch",
    callTime: "10:15",
  };

  const merged = mergeAiFields(existing, {
    ac: "",
    gate: "",
    problem: "also has a loose hinge",
    callTime: "",
  });

  assert.equal(merged.ac, "8742");
  assert.equal(merged.gate, "C72");
  assert.equal(merged.callTime, "10:15");
  assert.equal(merged.problem, "Lav door will not latch / also has a loose hinge");
});

test("mergeAiFields does not duplicate problem text when AI returns the full combined note", () => {
  const existing = {
    ac: "8742",
    problem: "Lav door will not latch",
  };

  const merged = mergeAiFields(existing, {
    problem: "Lav door will not latch / also has a loose hinge",
  });

  assert.equal(merged.problem, "Lav door will not latch / also has a loose hinge");
});
