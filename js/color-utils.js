export function hexToRgb(hex) {
  const s = String(hex).trim();
  if (!s) return null;
  let r, g, b;
  if (s.startsWith("#")) {
    const clean = s.slice(1);
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.slice(0, 2), 16);
      g = parseInt(clean.slice(2, 4), 16);
      b = parseInt(clean.slice(4, 6), 16);
    }
  } else if (s.startsWith("rgb(")) {
    const parts = s.match(/\d+/g);
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0], 10);
      g = parseInt(parts[1], 10);
      b = parseInt(parts[2], 10);
    }
  }
  if (r == null || isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function adjustColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: rgb.r + amount,
    g: rgb.g + amount,
    b: rgb.b + amount,
  });
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h, s, l };
}

export function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function hslToHex(h, s, l) {
  return rgbToHex(hslToRgb(h, s, l));
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function wrapHue(h) {
  h = h % 1;
  return h < 0 ? h + 1 : h;
}

export function isLight(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140;
}

export function sampleImageColors(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 200;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const samples = [];
      const step = Math.ceil(Math.sqrt((canvas.width * canvas.height) / 2500)) || 1;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const i = (y * canvas.width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          if (a < 128) continue;
          const hsl = rgbToHsl(r, g, b);
          samples.push({ r, g, b, ...hsl });
        }
      }
      resolve(samples);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function relativeLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b) + 0.05;
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

export function mixRgb(rgb1, rgb2, t) {
  return {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * t),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * t),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * t),
  };
}

export function chooseTextColorForContrast(bgRgb) {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 11, g: 11, b: 16 };
  const whiteRatio = contrastRatio(bgRgb, white);
  const blackRatio = contrastRatio(bgRgb, black);
  return whiteRatio >= blackRatio ? "#ffffff" : "#0b0b10";
}

function findBest(samples, scoringFn) {
  let best = null;
  let bestScore = -Infinity;
  for (const p of samples) {
    const score = scoringFn(p);
    if (score > bestScore) {
      bestScore = score;
      best = { ...p };
    }
  }
  if (!best) {
    best = { ...samples[0] };
  }
  return best;
}

export function extractSwatches(samples) {
  if (!samples.length) return null;

  const NH = 36;
  const bins = {};
  let totalH = 0;
  let totalS = 0;
  let totalL = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (const p of samples) {
    totalH += p.h;
    totalS += p.s;
    totalL += p.l;
    totalR += p.r;
    totalG += p.g;
    totalB += p.b;

    const binIdx = Math.floor(wrapHue(p.h) * NH);
    if (!bins[binIdx]) {
      bins[binIdx] = { count: 0, h: 0, s: 0, l: 0, r: 0, g: 0, b: 0 };
    }
    const bin = bins[binIdx];
    bin.count += 1;
    bin.h += p.h;
    bin.s += p.s;
    bin.l += p.l;
    bin.r += p.r;
    bin.g += p.g;
    bin.b += p.b;
  }

  const n = samples.length;
  const average = { h: totalH / n, s: totalS / n, l: totalL / n };

  const swatches = Object.keys(bins)
    .map((key) => {
      const bin = bins[key];
      const count = bin.count;
      return {
        h: bin.h / count,
        s: bin.s / count,
        l: bin.l / count,
        r: Math.round(bin.r / count),
        g: Math.round(bin.g / count),
        b: Math.round(bin.b / count),
        count,
        score: count * (0.15 + (bin.s / count) * 0.85),
      };
    })
    .filter((s) => s.count > n / (NH * 5))
    .sort((a, b) => b.score - a.score);

  const vibrant = findBest(
    samples,
    (p) => (p.s > 0.18 ? p.s : 0) * Math.max(0, 1 - Math.abs(p.l - 0.52) * 2)
  );
  const darkVibrant = findBest(
    samples,
    (p) => (p.s > 0.15 ? p.s : 0) * Math.max(0, 1 - Math.abs(p.l - 0.22) * 3)
  );
  const lightVibrant = findBest(
    samples,
    (p) => (p.s > 0.15 ? p.s : 0) * Math.max(0, 1 - Math.abs(p.l - 0.78) * 3)
  );
  const muted = findBest(samples, (p) => (p.s < 0.35 ? 1 - p.s : 0));

  return {
    swatches,
    dominant: swatches[0],
    average,
    vibrant,
    darkVibrant,
    lightVibrant,
    muted,
  };
}

export function getModeParams(mode, avgL) {
  const imageIsBright = avgL > 0.55;
  const baseLight = imageIsBright ? 0.06 : clamp(avgL * 0.28, 0.04, 0.11);

  const presets = {
    professional: {
      baseSat: 0.12,
      baseLight,
      accentSatFactor: 0.85,
      accentLight: 0.53,
      textLight: 0.93,
      textSatFactor: 0.35,
      borderAlpha: imageIsBright ? 0.1 : 0.08,
      glowAlpha: 0.32,
      contrastBoost: 1,
    },
    vibrant: {
      baseSat: 0.22,
      baseLight: clamp(baseLight + 0.012, 0.04, 0.12),
      accentSatFactor: 1.0,
      accentLight: 0.55,
      textLight: 0.94,
      textSatFactor: 0.45,
      borderAlpha: imageIsBright ? 0.12 : 0.09,
      glowAlpha: 0.4,
      contrastBoost: 1.05,
    },
    muted: {
      baseSat: 0.06,
      baseLight,
      accentSatFactor: 0.55,
      accentLight: 0.5,
      textLight: 0.92,
      textSatFactor: 0.15,
      borderAlpha: imageIsBright ? 0.08 : 0.06,
      glowAlpha: 0.22,
      contrastBoost: 1,
    },
    "high-contrast": {
      baseSat: 0.04,
      baseLight: 0.035,
      accentSatFactor: 0.92,
      accentLight: 0.54,
      textLight: 0.97,
      textSatFactor: 0.1,
      borderAlpha: imageIsBright ? 0.14 : 0.12,
      glowAlpha: 0.38,
      contrastBoost: 1.15,
    },
  };
  return presets[mode] || presets.professional;
}

export function buildThemeFromPalette(palette, mode = "professional") {
  const params = getModeParams(mode, palette.average.l);

  const baseHue = palette.dominant && palette.dominant.s > 0.08
    ? palette.dominant.h
    : palette.vibrant && palette.vibrant.s > 0.1
      ? palette.vibrant.h
      : palette.average.h;
  const baseSat = clamp(params.baseSat, 0.02, 0.32);

  const main = hslToHex(baseHue, baseSat, params.baseLight);
  const sidebar = hslToHex(baseHue, baseSat, clamp(params.baseLight + 0.065, 0, 1));
  const card = hslToHex(baseHue, clamp(baseSat * 1.2, 0, 0.34), clamp(params.baseLight + 0.13, 0, 1));
  const input = hslToHex(baseHue, baseSat, clamp(params.baseLight + 0.025, 0, 1));

  const accentSwatch = palette.vibrant && palette.vibrant.s > 0.12
    ? palette.vibrant
    : palette.dominant;
  const accentHue = accentSwatch.h;
  const accentSat = clamp(accentSwatch.s * params.accentSatFactor, 0.42, 0.92);
  const accentLight = clamp(
    params.accentLight + (accentSwatch.l - 0.5) * 0.12,
    0.42,
    0.65
  );

  const accent = hslToHex(accentHue, accentSat, accentLight);
  const accentHover = hslToHex(
    wrapHue(accentHue + 0.025),
    clamp(accentSat - 0.06, 0.35, 0.95),
    clamp(accentLight + 0.1, 0, 1)
  );
  const accentRgb = hslToRgb(accentHue, accentSat, accentLight);
  const accentText = chooseTextColorForContrast(accentRgb);

  const textLightness = clamp(
    params.textLight * params.contrastBoost,
    0.75,
    0.98
  );
  const primary = hslToHex(baseHue, clamp(baseSat * params.textSatFactor, 0, 0.08), textLightness);
  const secondary = hslToHex(baseHue, clamp(baseSat * params.textSatFactor * 0.7, 0, 0.06), textLightness - 0.18);
  const muted = hslToHex(baseHue, clamp(baseSat * params.textSatFactor * 0.5, 0, 0.05), clamp(textLightness - 0.34, 0.35, 0.7));

  const border = `rgba(255, 255, 255, ${params.borderAlpha.toFixed(2)})`;
  const glowAccent = `0 0 14px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${params.glowAlpha.toFixed(2)})`;

  return {
    colors: {
      accent,
      "accent-rgb": `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`,
      "accent-hover": accentHover,
      "accent-text": accentText,
    },
    text: { primary, secondary, muted },
    backgrounds: {
      main,
      sidebar,
      card,
      "item-active": accent,
      overlay: "rgba(0,0,0,0.7)",
      input,
    },
    borders: {
      color: border,
      radius: "8px",
      "radius-sm": "4px",
    },
    shadows: {
      "shadow-sm": "0 1px 3px rgba(0,0,0,0.5)",
      "shadow-md": "0 4px 6px rgba(0,0,0,0.3)",
      "glow-accent": glowAccent,
    },
    others: {
      "icon-filter": "invert(1)",
      "color-success": "#22c55e",
      "color-error": "#ef4444",
      "color-warning": "#f59e0b",
      "color-status-starting": "#f97316",
      "color-status-started": "#22c55e",
      "scrollbar-track": main,
      "scrollbar-thumb": accent,
    },
  };
}
