const createColorFunction = (text) => text;
const createBoldColorFunction = (text) => text;

const chalkMock = {
  hex: () => createColorFunction,
  red: createColorFunction,
  green: createColorFunction,
  yellow: createColorFunction,
  blue: createColorFunction,
  magenta: createColorFunction,
  cyan: createColorFunction,
  dim: createColorFunction,
  bold: createColorFunction,
  greenBright: createColorFunction,
  redBright: createColorFunction,
  default: {
    hex: () => createColorFunction,
    red: { bold: createBoldColorFunction },
    green: { bold: createBoldColorFunction },
    yellow: { bold: createBoldColorFunction },
    blue: { bold: createBoldColorFunction },
    magenta: { bold: createBoldColorFunction },
    cyan: { bold: createBoldColorFunction },
    dim: createColorFunction,
    bold: createColorFunction
  }
};

module.exports = chalkMock;
