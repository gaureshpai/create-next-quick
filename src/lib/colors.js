const codes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

const createBuilder = (currentStyles = []) => {
  const builder = (str) => {
    let result = str;
    // Apply styles in reverse order (stack-like) or just concat
    // standard chalk applies formatting: start + string + end
    // actually, we just need to wrap the string.
    for (let i = currentStyles.length - 1; i >= 0; i--) {
      const styleName = currentStyles[i];
      const open = codes[styleName] || styleName;
      // naive reset generally works, but we can be better if needed.
      // for simplicity, just appending reset at the end is usually enough
      // but chalk does nested handling.
      // Let's keep it simple: just wrap.
      result = open + result + codes.reset;
    }
    return result;
  };

  // Add properties to the builder
  Object.keys(codes).forEach((key) => {
    Object.defineProperty(builder, key, {
      get: () => {
        return createBuilder([...currentStyles, key]);
      },
    });
  });

  // Basic hex-to-ANSI approximation
  builder.hex = (hex) => {
    // Remove hash if present
    const cleanHex = hex.replace(/^#/, "");

    // Parse r, g, b
    let r, g, b;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }

    // Convert to nearest ANSI 256 color
    // 6x6x6 color cube: 16 + 36*R + 6*G + B
    // Map 0-255 to 0-5
    const r6 = Math.round((r / 255) * 5);
    const g6 = Math.round((g / 255) * 5);
    const b6 = Math.round((b / 255) * 5);
    const ansiCode = 16 + 36 * r6 + 6 * g6 + b6;

    const _open = `\x1b[38;5;${ansiCode}m`;

    return createBuilder([...currentStyles, `\x1b[38;5;${ansiCode}m`]);
  };

  return builder;
};

const chalk = createBuilder();
export default chalk;
