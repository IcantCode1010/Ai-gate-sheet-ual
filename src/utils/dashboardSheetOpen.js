export function getDashboardSheetOpenMode(shift, currentUserId) {
  return shift?.user_id === currentUserId ? "editable-own-sheet" : "read-only-other-sheet";
}
