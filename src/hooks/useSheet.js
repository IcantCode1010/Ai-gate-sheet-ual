import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "hmc-gate-sheet-v1";

function currentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function newEntry() {
  return {
    id: uuidv4(),
    ac: "", gate: "", fltIn: "", timeIn: "",
    fltOut: "", timeOut: "", problem: "",
    callTime: currentHHMM(), dispTime: "", cwTime: "",
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function includesExistingProblem(existingProblem, incomingProblem) {
  const existing = normalizeText(existingProblem).toLowerCase();
  const incoming = normalizeText(incomingProblem).toLowerCase();
  return existing && incoming.includes(existing);
}

export function mergeAiFields(existingEntry, fields) {
  const updated = { ...existingEntry };

  Object.keys(fields).forEach(key => {
    const value = fields[key];
    if (value === "") return;

    if (key === "problem") {
      const existingProblem = normalizeText(existingEntry.problem);
      const incomingProblem = normalizeText(value);
      if (!incomingProblem) return;
      if (!existingProblem || includesExistingProblem(existingProblem, incomingProblem)) {
        updated.problem = value;
      } else if (existingProblem.toLowerCase() !== incomingProblem.toLowerCase()) {
        updated.problem = `${existingEntry.problem} / ${value}`;
      }
      return;
    }

    updated[key] = value;
  });

  return updated;
}

export function useSheet() {
  const [sheet, setSheet] = useState(() => {
    const saved = loadFromStorage();
    return saved || {
      date: todayISO(),
      shiftType: "",
      coordinatorName: "",
      notes: "",
      entries: [newEntry()],
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
  }, [sheet]);

  const updateSheetField = useCallback((field, value) => {
    setSheet(s => ({ ...s, [field]: value }));
  }, []);

  const updateEntry = useCallback((index, fields) => {
    setSheet(s => {
      const entries = s.entries.map((e, i) =>
        i === index ? { ...e, ...fields } : e
      );
      return { ...s, entries };
    });
  }, []);

  const addEntry = useCallback(() => {
    setSheet(s => {
      const entries = [...s.entries, newEntry()];
      return { ...s, entries };
    });
  }, []);

  const removeEntry = useCallback((index) => {
    setSheet(s => {
      if (s.entries.length === 1) return s;
      const entries = s.entries.filter((_, i) => i !== index);
      return { ...s, entries };
    });
    setActiveIndex(i => Math.max(0, i >= index ? i - 1 : i));
  }, []);

  const newSheet = useCallback(() => {
    const fresh = {
      date: todayISO(),
      shiftType: "",
      coordinatorName: "",
      notes: "",
      entries: [newEntry()],
    };
    setSheet(fresh);
    setActiveIndex(0);
  }, []);

  const applyAiFields = useCallback((index, fields) => {
    setSheet(s => {
      const entries = s.entries.map((e, i) => {
        if (i !== index) return e;
        return mergeAiFields(e, fields);
      });
      return { ...s, entries };
    });
  }, []);

  // Atomically adds a new row pre-filled with AI fields and makes it active.
  // Returns the new row index so ChatPanel can reference it in the confirmation message.
  const addAndApplyFields = useCallback((fields, currentLength) => {
    const newIndex = currentLength;
    setSheet(s => {
      const entry = { ...newEntry() };
      Object.keys(fields).forEach(key => {
        if (fields[key] !== "") entry[key] = fields[key];
      });
      return { ...s, entries: [...s.entries, entry] };
    });
    setActiveIndex(newIndex);
    return newIndex;
  }, []);

  return {
    sheet,
    activeIndex,
    setActiveIndex,
    updateSheetField,
    updateEntry,
    addEntry,
    removeEntry,
    newSheet,
    applyAiFields,
    addAndApplyFields,
  };
}
