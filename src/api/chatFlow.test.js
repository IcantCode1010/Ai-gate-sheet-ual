import assert from "node:assert/strict";
import test from "node:test";
import { parseFieldsBlock } from "./chat.js";
import { resolveChatFieldAction } from "./chatFlow.js";
import { mergeAiFields } from "../hooks/useSheet.js";

test("mocked AI follow-up updates selected row problem without repeating aircraft", () => {
  const currentEntry = {
    ac: "8742",
    gate: "C72",
    problem: "Lav door will not latch",
    callTime: "10:15",
  };
  const aiText = `Added the follow-up to Row 2.
<FIELDS>{"ac":"","gate":"","fltIn":"","timeIn":"","fltOut":"","timeOut":"","problem":"also has a loose hinge","callTime":"","dispTime":"","cwTime":""}</FIELDS>`;

  const fields = parseFieldsBlock(aiText);
  const action = resolveChatFieldAction(currentEntry, fields);
  const updatedEntry = mergeAiFields(currentEntry, action.fields);

  assert.equal(action.type, "updateSelectedRow");
  assert.equal(updatedEntry.ac, "8742");
  assert.equal(updatedEntry.gate, "C72");
  assert.equal(updatedEntry.problem, "Lav door will not latch / also has a loose hinge");
});

test("mocked AI aircraft mismatch routes to a new row", () => {
  const currentEntry = {
    ac: "8742",
    gate: "C72",
    problem: "Lav door will not latch",
  };
  const aiText = `That sounds like a different aircraft, so I will add a new row.
<FIELDS>{"ac":"9123","gate":"B4","fltIn":"","timeIn":"","fltOut":"","timeOut":"","problem":"APU will not start","callTime":"","dispTime":"","cwTime":""}</FIELDS>`;

  const fields = parseFieldsBlock(aiText);
  const action = resolveChatFieldAction(currentEntry, fields);

  assert.equal(action.type, "addNewRow");
  assert.equal(action.fields.ac, "9123");
  assert.equal(action.fields.problem, "APU will not start");
});
