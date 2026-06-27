import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardSheetOpenMode } from "./dashboardSheetOpen.js";

test("own dashboard sheets open in editable main sheet mode", () => {
  assert.equal(
    getDashboardSheetOpenMode({ user_id: "user-1" }, "user-1"),
    "editable-own-sheet"
  );
});

test("other users dashboard sheets open read-only", () => {
  assert.equal(
    getDashboardSheetOpenMode({ user_id: "user-2" }, "user-1"),
    "read-only-other-sheet"
  );
});
