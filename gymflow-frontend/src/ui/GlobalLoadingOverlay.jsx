import React, { useEffect, useState } from 'react';
import { globalLoading } from './globalLoading';
import LoadingScreen from './LoadingScreen';

// Shows a subtle fullscreen overlay spinner when any API request is in-flight.
// Uses a small delay to avoid flicker on very fast calls.
export default function GlobalLoadingOverlay({ delayMs = 400, fadeOutMs = 150, label = 'Loading…' }) {
  const [inFlight, setInFlight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer = null;
    let hideTimer = null;

    const update = (cnt) => {
      setInFlight(cnt);
      if (cnt > 0) {
        clearTimeout(hideTimer);
        if (!visible) {
          clearTimeout(showTimer);
          showTimer = setTimeout(() => setVisible(true), delayMs);
        }
      } else {
        clearTimeout(showTimer);
        hideTimer = setTimeout(() => setVisible(false), fadeOutMs);
      }
    };

    const unsub = globalLoading.subscribe(update);
    return () => { unsub(); clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [delayMs, fadeOutMs, visible]);

  if (!visible) return null;
  return <LoadingScreen label={label} />;
}
