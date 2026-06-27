export function mapShiftToReadOnlySheet(shift) {
  return {
    date: shift?.date || "",
    shiftType: shift?.shift_type || "",
    coordinatorName: shift?.coordinator_name || "",
    notes: shift?.notes || "",
    entries: Array.isArray(shift?.entries) ? shift.entries : [],
  };
}
