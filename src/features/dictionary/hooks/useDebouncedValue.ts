import { useEffect, useState } from "react";

// Returns `value` only after it has stopped changing for `delayMs`.
// Used so we search once the user pauses typing, not on every key.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
