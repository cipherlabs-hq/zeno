// WCAG 2.x relative luminance and contrast ratio, with alpha compositing.

/** Parses `#rgb`, `#rrggbb`, `#rrggbbaa` or `rgb()/rgba()` into [r, g, b, a], channels 0-255, alpha 0-1. */
export function parseColor(input) {
  const value = String(input).trim().toLowerCase();
  let match = /^#([0-9a-f]{3})$/.exec(value);
  if (match) {
    return [...match[1]].map(c => parseInt(c + c, 16)).concat(1);
  }
  match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(value);
  if (match) {
    const [r, g, b] = [0, 2, 4].map(i =>
      parseInt(match[1].slice(i, i + 2), 16)
    );
    return [r, g, b, match[2] ? parseInt(match[2], 16) / 255 : 1];
  }
  match =
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/.exec(
      value
    );
  if (match) {
    return [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      match[4] === undefined ? 1 : Number(match[4]),
    ];
  }
  throw new Error(`Cannot parse colour "${input}"`);
}

/** Composites a possibly translucent colour over an opaque one. */
export function composite(top, bottom) {
  const [r, g, b, a] = top;
  if (bottom[3] !== 1) {
    throw new Error('The backdrop of a composite must be opaque');
  }
  return [
    r * a + bottom[0] * (1 - a),
    g * a + bottom[1] * (1 - a),
    b * a + bottom[2] * (1 - a),
    1,
  ];
}

export function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map(channel => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
