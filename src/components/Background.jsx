import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GLOBE from 'vanta/src/vanta.globe';

export default function Background() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      try {
        setVantaEffect(GLOBE({
          el: myRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x8a2be2,
          color2: 0x00f0ff,
          size: 1.10,
          backgroundColor: 0x0B0F19
        }));
      } catch (err) {
        console.error("Vanta initialization failed:", err);
      }
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div ref={myRef} className="fixed inset-0 z-[-1] overflow-hidden" />
  );
}
