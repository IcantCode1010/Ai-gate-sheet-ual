import assert from "node:assert/strict";
import test from "node:test";
import { mapShiftToReadOnlySheet } from "./readOnlySheet.js";

test("mapShiftToReadOnlySheet maps saved shift fields to read-only sheet shape", () => {
  const sheet = mapShiftToReadOnlySheet({
    date: "2026-06-27",
    shift_type: "Day",
    coordinator_name: "Ellis",
    notes: "Busy morning",
    entries: [{ ac: "8742", gate: "C72", problem: "Lav door will not latch" }],
  });

  assert.deepEqual(sheet, {
    date: "2026-06-27",
    shiftType: "Day",
    coordinatorName: "Ellis",
    notes: "Busy morning",
    entries: [{ ac: "8742", gate: "C72", problem: "Lav door will not latch" }],
  });
});

test("mapShiftToReadOnlySheet falls back to an empty entries array", () => {
  const sheet = mapShiftToReadOnlySheet({ date: "2026-06-27" });

  assert.deepEqual(sheet.entries, []);
});
