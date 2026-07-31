"""Generate the tiny UI sound effects used by @vueuse/sound.

Outputs 16-bit mono 44.1 kHz WAVs into public/sounds:
  pop.wav    - copy confirmation (soft descending pop)
  tick.wav   - selection / tab change (quiet high tick)
  toggle.wav - option switch (two-tone blip)
"""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sounds"


def tone(
    freq_start: float,
    freq_end: float,
    dur: float,
    vol: float = 1.0,
    decay: float = 14.0,
    attack: float = 0.003,
) -> list[float]:
    n = int(SR * dur)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = freq_start + (freq_end - freq_start) * t
        phase += 2.0 * math.pi * freq / SR
        amp = vol * math.exp(-decay * t) * min(1.0, i / max(1, SR * attack))
        out.append(math.sin(phase) * amp)
    return out


def silence(dur: float) -> list[float]:
    return [0.0] * int(SR * dur)


def write_wav(name: str, samples: list[float]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    frames = b"".join(
        struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767)) for s in samples
    )
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames)
    print(f"wrote {path.name} ({len(samples) / SR * 1000:.0f} ms)")


write_wav("pop.wav", tone(880, 460, 0.10, vol=0.85, decay=18))
write_wav("tick.wav", tone(1500, 1150, 0.05, vol=0.5, decay=30))
write_wav(
    "toggle.wav",
    tone(480, 480, 0.045, vol=0.6, decay=20)
    + silence(0.012)
    + tone(700, 700, 0.06, vol=0.6, decay=18),
)
