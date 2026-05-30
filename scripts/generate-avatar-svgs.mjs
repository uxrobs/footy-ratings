import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "images");

function svg(body, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="45" height="45" role="img" aria-hidden="true">
  <defs>
    <clipPath id="${id}">
      <rect width="45" height="45" rx="8" ry="8"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${id})">${body}</g>
</svg>`;
}

function hThirds(top, mid, bot) {
  return `
    <rect x="0" y="0" width="45" height="15" fill="${top}"/>
    <rect x="0" y="15" width="45" height="15" fill="${mid}"/>
    <rect x="0" y="30" width="45" height="15" fill="${bot}"/>`;
}

function vThirds(left, mid, right) {
  return `
    <rect x="0" y="0" width="15" height="45" fill="${left}"/>
    <rect x="15" y="0" width="15" height="45" fill="${mid}"/>
    <rect x="30" y="0" width="15" height="45" fill="${right}"/>`;
}

function hSplit(top, bot, split = 20) {
  return `
    <rect x="0" y="0" width="45" height="${split}" fill="${top}"/>
    <rect x="0" y="${split}" width="45" height="${45 - split}" fill="${bot}"/>`;
}

function diagonalStripe(bg, stripe, flipHorizontal = false) {
  const rotation = flipHorizontal ? -45 : 45;
  return `
    <rect width="45" height="45" fill="${bg}"/>
    <rect x="-8" y="14" width="70" height="16" transform="rotate(${rotation} 22.5 22.5)" fill="${stripe}"/>`;
}

function topTriangle(bg, tri) {
  return `
    <rect width="45" height="45" fill="${bg}"/>
    <polygon points="0,0 45,0 22.5,22" fill="${tri}"/>`;
}

function porChevrons() {
  return `
    <rect width="45" height="45" fill="#000000"/>
    <polygon points="0,10 45,10 22.5,28" fill="#ffffff"/>
    <polygon points="5,14 40,14 22.5,23" fill="#7dcbcc"/>`;
}

const avatars = {
  ADE: hThirds("#002b5c", "#e31c35", "#ffd008"),
  BRI: hSplit("#0055a5", "#850037"),
  CAR: `<rect width="45" height="45" fill="#012e57"/>`,
  COL: vThirds("#010101", "#ffffff", "#010101"),
  ESS: diagonalStripe("#010101", "#e61938", true),
  FRE: topTriangle("#47166a", "#ffffff"),
  GCS: vThirds("#ffe153", "#ec3b43", "#ffe153"),
  GEE: hThirds("#012a5a", "#ffffff", "#012a5a"),
  GWS: hSplit("#53534c", "#f68f1e"),
  HAW: vThirds("#4d2004", "#fbbf15", "#4d2004"),
  MEL: topTriangle("#002a5c", "#e61938"),
  NOR: vThirds("#0155a6", "#ffffff", "#0155a6"),
  POR: porChevrons(),
  RIC: diagonalStripe("#010101", "#fed204", true),
  STK: vThirds("#e61938", "#ffffff", "#000000"),
  SYD: topTriangle("#ffffff", "#e61938"),
  WCE: vThirds("#002a5c", "#ffffff", "#ffc424"),
  WBD: hThirds("#015cac", "#ffffff", "#e21d2f"),
};

for (const [code, body] of Object.entries(avatars)) {
  const file = path.join(OUT, `Avatar-${code}.svg`);
  fs.writeFileSync(file, svg(body, `clip-${code.toLowerCase()}`));
  console.log("wrote", file);
}
