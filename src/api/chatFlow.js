export function resolveChatFieldAction(currentEntry, fields) {
  const incomingAc = fields?.ac?.trim();
  const existingAc = currentEntry?.ac?.trim();

  if (incomingAc && existingAc && incomingAc !== existingAc) {
    return { type: "addNewRow", fields };
  }

  return { type: "updateSelectedRow", fields };
}
