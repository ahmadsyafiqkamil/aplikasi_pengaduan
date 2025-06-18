
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setReactStateValue] = useState<T>(readValue);

  const setValue: React.Dispatch<React.SetStateAction<T>> = (valueOrUpdater) => {
    try {
      if (typeof valueOrUpdater === 'function') {
        setReactStateValue(prevState => {
          const newValue = (valueOrUpdater as (prevState: T) => T)(prevState);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          }
          return newValue;
        });
      } else {
        const newValue = valueOrUpdater;
        setReactStateValue(newValue);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    // This effect ensures that if the localStorage value is updated by another tab/window,
    // or if the initial readValue was somehow stale (though less likely with current setup),
    // the component's state reflects the current localStorage value.
    // However, for typical single-page app behavior without external changes,
    // readValue() on mount is often sufficient.
    // For now, keeping the initial mount logic. If cross-tab sync is needed, 'storage' event listener would be more robust.
    setReactStateValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Key is not expected to change for a given instance of the hook.

  return [storedValue, setValue];
}

export default useLocalStorage;
