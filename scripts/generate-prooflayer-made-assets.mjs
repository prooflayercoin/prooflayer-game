import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outRoot = path.join(root, "apps/web/public/prooflayer-made");
const sourceRoot = path.join(outRoot, "_source-svg");

const dirs = [
  "inventory-icons",
  "skill-icons",
  "ui",
  "quest-portraits",
  "shop-signs",
  "item-cards",
  "textures",
  "isometric-sprites",
  "_source-svg",
];

const palette = {
  ink: "#17100a",
  panel: "#24160c",
  panel2: "#3a2514",
  edge: "#8d6030",
  gold: "#e0ad4e",
  gold2: "#ffe28a",
  parchment: "#f7e6bd",
  moss: "#6e9947",
  grass: "#7eab42",
  dirt: "#b48355",
  water: "#3e8ca1",
  stone: "#8a8175",
  copper: "#bd6938",
  iron: "#a2a9a8",
  red: "#a7352f",
  blue: "#2f6e9e",
  green: "#4f8f4d",
};

function svgShell(width, height, body, defs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity=".45"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
    <linearGradient id="panelGrad" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${palette.panel2}"/>
      <stop offset="1" stop-color="${palette.ink}"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" x2="1">
      <stop offset="0" stop-color="${palette.gold2}"/>
      <stop offset=".45" stop-color="${palette.gold}"/>
      <stop offset="1" stop-color="#8e5a20"/>
    </linearGradient>
    ${defs}
  </defs>
  ${body}
</svg>`;
}

function iconFrame(inner) {
  return `
  <rect x="6" y="6" width="116" height="116" rx="14" fill="url(#panelGrad)" stroke="${palette.edge}" stroke-width="4" filter="url(#shadow)"/>
  <rect x="14" y="14" width="100" height="100" rx="10" fill="#120c07" opacity=".78" stroke="#000" stroke-width="2"/>
  <circle cx="36" cy="30" r="18" fill="${palette.gold2}" opacity=".12"/>
  ${inner}`;
}

const itemBodies = {
  copper_ore: `<g transform="translate(0 0)">
    <path d="M30 82 L47 50 L70 44 L96 69 L86 93 L55 101 Z" fill="${palette.copper}" stroke="#3b2214" stroke-width="5"/>
    <path d="M47 50 L61 78 L70 44" fill="#e19955" opacity=".65"/>
    <circle cx="72" cy="70" r="8" fill="#ffd28a" opacity=".5"/>
  </g>`,
  dim_shard: `<g>
    <path d="M63 20 L90 63 L70 108 L39 96 L31 57 Z" fill="#58a8cf" stroke="#123447" stroke-width="5"/>
    <path d="M63 20 L63 98 L90 63 Z" fill="#a6e6ff" opacity=".55"/>
    <path d="M39 96 L63 98 L31 57 Z" fill="#2c6f91"/>
  </g>`,
  aether_stalk: `<g stroke-linecap="round">
    <path d="M67 100 C52 78 49 51 58 25" fill="none" stroke="#6bae43" stroke-width="10"/>
    <path d="M59 58 C36 47 31 30 49 22 C60 34 64 44 59 58Z" fill="#8ed16a" stroke="#2f5b29" stroke-width="4"/>
    <path d="M67 74 C91 60 93 41 73 35 C63 50 62 62 67 74Z" fill="#6fc168" stroke="#2f5b29" stroke-width="4"/>
  </g>`,
  timber_log: `<g>
    <ellipse cx="44" cy="77" rx="20" ry="12" fill="#c7894c" stroke="#4b2b15" stroke-width="5"/>
    <path d="M44 65 L88 44 C101 40 110 55 98 63 L54 87Z" fill="#9a5d2d" stroke="#4b2b15" stroke-width="5"/>
    <path d="M53 66 L92 47 M59 79 L99 58" stroke="#d9a36a" stroke-width="3" opacity=".8"/>
  </g>`,
  sunleaf: `<g>
    <path d="M64 104 C43 76 44 39 64 21 C86 42 88 78 64 104Z" fill="#72b84b" stroke="#224a23" stroke-width="5"/>
    <path d="M64 104 C64 70 63 46 64 21" stroke="#d6e77c" stroke-width="4"/>
    <path d="M48 58 L64 70 L82 55 M51 80 L64 89 L78 78" stroke="#d6e77c" stroke-width="3" opacity=".8"/>
  </g>`,
  minor_tonic: `<g>
    <path d="M51 28 H77 L74 46 C89 58 91 91 64 101 C37 91 39 58 54 46Z" fill="#4b9f8c" stroke="#15332e" stroke-width="5"/>
    <path d="M48 68 C57 61 72 61 82 70 C82 86 73 97 64 100 C52 96 45 84 48 68Z" fill="#72e0c6"/>
    <rect x="51" y="21" width="26" height="13" rx="3" fill="#d1b37a" stroke="#5c3a1b" stroke-width="4"/>
  </g>`,
  gold_coins: `<g>
    <ellipse cx="61" cy="82" rx="32" ry="13" fill="#c9871e" stroke="#5c3512" stroke-width="5"/>
    <ellipse cx="70" cy="64" rx="32" ry="13" fill="#e2a83a" stroke="#5c3512" stroke-width="5"/>
    <ellipse cx="55" cy="47" rx="32" ry="13" fill="${palette.gold2}" stroke="#5c3512" stroke-width="5"/>
    <path d="M41 44 C50 50 67 51 79 43" fill="none" stroke="#fff2a7" stroke-width="3" opacity=".8"/>
  </g>`,
  pickaxe: `<g>
    <path d="M40 34 C62 19 89 24 102 39 C76 34 59 39 43 55Z" fill="${palette.iron}" stroke="#26302c" stroke-width="5"/>
    <rect x="57" y="42" width="12" height="70" rx="5" transform="rotate(38 63 77)" fill="#8b5129" stroke="#3a2112" stroke-width="4"/>
  </g>`,
  hammer: `<g>
    <rect x="45" y="28" width="50" height="23" rx="4" transform="rotate(18 70 40)" fill="${palette.iron}" stroke="#26302c" stroke-width="5"/>
    <rect x="57" y="44" width="12" height="72" rx="5" transform="rotate(30 63 80)" fill="#8b5129" stroke="#3a2112" stroke-width="4"/>
  </g>`,
  axe: `<g>
    <rect x="58" y="33" width="12" height="76" rx="5" transform="rotate(20 64 71)" fill="#8b5129" stroke="#3a2112" stroke-width="4"/>
    <path d="M67 25 C96 30 100 57 71 68 C78 52 79 39 67 25Z" fill="${palette.iron}" stroke="#26302c" stroke-width="5"/>
  </g>`,
  sword: `<g>
    <path d="M67 17 L78 74 L64 91 L50 74 Z" fill="${palette.iron}" stroke="#26302c" stroke-width="5"/>
    <path d="M34 78 L94 78" stroke="${palette.gold}" stroke-width="9" stroke-linecap="round"/>
    <path d="M64 84 L64 109" stroke="#7b4726" stroke-width="10" stroke-linecap="round"/>
  </g>`,
  shield: `<g>
    <path d="M64 21 C82 29 96 30 101 32 C100 73 88 96 64 108 C40 96 28 73 27 32 C34 30 48 29 64 21Z" fill="${palette.blue}" stroke="#24374d" stroke-width="5"/>
    <path d="M64 26 L64 101" stroke="${palette.gold2}" stroke-width="6"/>
    <path d="M36 45 H92" stroke="${palette.gold2}" stroke-width="6"/>
  </g>`,
  bread: `<g>
    <path d="M33 73 C35 42 54 28 77 34 C96 39 101 58 94 82 C74 94 51 92 33 73Z" fill="#d59a52" stroke="#5a3419" stroke-width="5"/>
    <path d="M50 46 C48 57 54 62 64 64 M73 43 C69 55 75 62 85 64" stroke="#fff0bb" stroke-width="5" stroke-linecap="round" opacity=".7"/>
  </g>`,
  river_fish: `<g>
    <path d="M28 65 C48 38 83 40 102 64 C82 90 47 91 28 65Z" fill="#7db7c9" stroke="#1d4655" stroke-width="5"/>
    <path d="M102 64 L115 47 L113 83 Z" fill="#5799b2" stroke="#1d4655" stroke-width="5"/>
    <circle cx="48" cy="59" r="4" fill="#111"/>
  </g>`,
  field_scroll: `<g>
    <path d="M37 31 H86 C95 32 94 47 85 47 H49 C41 48 41 64 49 64 H89 V95 H39 C30 94 29 80 39 79 H74 C83 78 83 64 74 64 H37Z" fill="#e8d1a0" stroke="#6c431f" stroke-width="5"/>
    <path d="M52 52 H83 M53 70 H76 M52 84 H82" stroke="#7b4e25" stroke-width="3"/>
  </g>`,
  proof_gem: `<g>
    <path d="M64 19 L99 48 L84 96 L64 111 L44 96 L29 48Z" fill="#9a6cff" stroke="#30215c" stroke-width="5"/>
    <path d="M64 19 L64 111 L99 48Z" fill="#d9c8ff" opacity=".45"/>
    <path d="M29 48 H99 M44 96 L64 48 L84 96" stroke="#fff" stroke-width="3" opacity=".35"/>
  </g>`,
};

const skillBodies = {
  reaping: itemBodies.aether_stalk,
  quarrying: itemBodies.pickaxe,
  tempering: itemBodies.hammer,
  tracking: `<g><path d="M30 80 C49 45 78 39 100 29" stroke="#c99656" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M85 23 L107 27 L95 47" fill="none" stroke="${palette.gold2}" stroke-width="7" stroke-linecap="round"/><circle cx="42" cy="84" r="11" fill="#6e9947" stroke="#1d361c" stroke-width="4"/></g>`,
  distilling: itemBodies.minor_tonic,
  sealing: `<g><circle cx="64" cy="64" r="38" fill="#5f52b7" stroke="#211a54" stroke-width="5"/><path d="M64 24 L75 52 L105 52 L81 70 L91 100 L64 82 L37 100 L47 70 L23 52 L53 52Z" fill="${palette.gold2}" stroke="#6e461b" stroke-width="4"/></g>`,
  trading: itemBodies.gold_coins,
  crafting: itemBodies.axe,
};

const portraitData = [
  ["warden-vale", "#375b3d", "#d5b174", "W", "hooded quest warden"],
  ["trader-mara", "#6b3c22", "#e0a751", "M", "market trader"],
  ["smith-orren", "#473733", "#c16a38", "O", "forge smith"],
  ["seer-iona", "#332c69", "#9d83e6", "I", "sealing mentor"],
];

const signData = [
  ["market-hall", "MARKET", "Crates • Coin • Trade", "#6d4526"],
  ["ember-forge", "FORGE", "Ore • Tools • Heat", "#6a2c20"],
  ["prooflayer-guild", "GUILD", "Contracts • Skills", "#344c30"],
  ["quarry-camp", "QUARRY", "Stone • Rails • Ore", "#4b453b"],
  ["apothecary", "TONICS", "Herbs • Bottles", "#35534d"],
];

const textureData = [
  ["grass-meadow", palette.grass, "#5e8d37", "#93bd56"],
  ["dirt-path", palette.dirt, "#8f6845", "#d0a06e"],
  ["stone-path", "#81786c", "#5e574f", "#aaa091"],
  ["river-water", palette.water, "#2d6679", "#78c2cf"],
  ["wood-planks", "#7b4d29", "#4d2d17", "#bd8350"],
  ["cave-rock", "#4e4a46", "#2f2c2a", "#77716a"],
];

const isoSprites = [
  ["mine-cart", "cart"],
  ["ore-vein", "ore"],
  ["rail-straight", "rail"],
  ["timber-support", "support"],
  ["market-stall", "stall"],
  ["crystal-cluster", "crystal"],
  ["worker-idle", "worker"],
  ["pine-tree", "tree"],
];

async function renderSvg(relative, width, height, body, defs = "") {
  const svg = svgShell(width, height, body, defs);
  const svgPath = path.join(sourceRoot, relative.replace(/\.png$/, ".svg"));
  const pngPath = path.join(outRoot, relative);
  await mkdir(path.dirname(svgPath), { recursive: true });
  await mkdir(path.dirname(pngPath), { recursive: true });
  await writeFile(svgPath, svg);
  await execFileAsync("magick", ["-background", "none", svgPath, pngPath]);
}

function itemCard(name, title, subtitle, body) {
  return `
  <rect x="8" y="8" width="240" height="336" rx="18" fill="url(#panelGrad)" stroke="${palette.edge}" stroke-width="5" filter="url(#shadow)"/>
  <rect x="22" y="22" width="212" height="180" rx="13" fill="#0d0906" stroke="#3a2514" stroke-width="3"/>
  <g transform="translate(64 52) scale(1.05)">${body}</g>
  <text x="128" y="235" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="22" font-weight="700" fill="${palette.parchment}">${title}</text>
  <text x="128" y="263" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="13" fill="${palette.gold2}">${subtitle}</text>
  <path d="M40 292 H216" stroke="${palette.edge}" stroke-width="2"/>
  <text x="128" y="319" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="12" fill="${palette.parchment}">Prooflayer field card</text>`;
}

function textureBody(base, dark, light) {
  const bits = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 47) % 256;
    const y = (i * 83) % 256;
    const r = 4 + (i % 9);
    const color = i % 3 === 0 ? light : dark;
    return `<ellipse cx="${x}" cy="${y}" rx="${r * 1.8}" ry="${r}" fill="${color}" opacity=".28" transform="rotate(${(i * 31) % 180} ${x} ${y})"/>`;
  }).join("");
  return `<rect width="256" height="256" fill="${base}"/>${bits}<path d="M0 44 C54 26 98 73 150 45 C193 22 217 49 256 35 V0 H0Z" fill="${light}" opacity=".14"/><path d="M0 226 C55 205 91 238 142 216 C191 195 221 226 256 210 V256 H0Z" fill="${dark}" opacity=".2"/>`;
}

function isoDiamond(cx, cy, w, h, fill, stroke = "#2b2118") {
  return `<path d="M${cx} ${cy - h / 2} L${cx + w / 2} ${cy} L${cx} ${cy + h / 2} L${cx - w / 2} ${cy}Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
}

function isoBody(kind) {
  const shadow = `<ellipse cx="128" cy="180" rx="72" ry="24" fill="#000" opacity=".22"/>`;
  if (kind === "cart") {
    return `${shadow}${isoDiamond(128, 158, 120, 58, "#5b3920")}<path d="M80 135 L176 135 L164 177 L92 177Z" fill="#7d4b29" stroke="#2c1b10" stroke-width="5"/><path d="M94 128 H164 L177 143 H81Z" fill="#a36a3d" stroke="#2c1b10" stroke-width="5"/><circle cx="94" cy="180" r="13" fill="#2d2b29" stroke="#0d0b09" stroke-width="5"/><circle cx="164" cy="180" r="13" fill="#2d2b29" stroke="#0d0b09" stroke-width="5"/>`;
  }
  if (kind === "ore") {
    return `${shadow}${isoDiamond(128, 184, 110, 50, "#6d665c")}<path d="M75 161 L105 104 L145 96 L188 154 L165 190 L99 193Z" fill="#6b635d" stroke="#282522" stroke-width="5"/><path d="M103 136 L130 111 L154 145 L131 158Z" fill="${palette.copper}" stroke="#4d2718" stroke-width="4"/><path d="M126 101 L145 96 L188 154 L151 141Z" fill="#928981" opacity=".6"/>`;
  }
  if (kind === "rail") {
    return `${shadow}${isoDiamond(128, 175, 150, 64, "#9a744d")}<path d="M67 159 L180 121 M82 182 L195 144" stroke="#3c2817" stroke-width="9" stroke-linecap="round"/><path d="M87 156 L103 181 M116 146 L132 171 M146 136 L162 161 M174 126 L190 151" stroke="#8c5b34" stroke-width="7" stroke-linecap="round"/>`;
  }
  if (kind === "support") {
    return `${shadow}${isoDiamond(128, 188, 120, 42, "#6f5134")}<path d="M80 174 V94 L96 86 V166Z" fill="#6b3f22" stroke="#2d1b10" stroke-width="5"/><path d="M176 174 V94 L160 86 V166Z" fill="#6b3f22" stroke="#2d1b10" stroke-width="5"/><path d="M82 93 L162 54 L177 69 L96 108Z" fill="#986039" stroke="#2d1b10" stroke-width="5"/>`;
  }
  if (kind === "stall") {
    return `${shadow}${isoDiamond(128, 181, 150, 62, "#7a5632")}<path d="M72 139 L128 102 L184 139 L128 174Z" fill="#2f6e9e" stroke="#1a334a" stroke-width="5"/><path d="M72 139 L128 102 L184 139 L176 154 L128 120 L80 154Z" fill="#f0dfb5" opacity=".9"/><path d="M86 156 H170 V190 H86Z" fill="#8d5b32" stroke="#35200f" stroke-width="5"/><circle cx="108" cy="172" r="8" fill="#77a94b"/><circle cx="130" cy="170" r="8" fill="#c33f33"/><circle cx="151" cy="172" r="8" fill="#d99c33"/>`;
  }
  if (kind === "crystal") {
    return `${shadow}${isoDiamond(128, 185, 112, 42, "#635a53")}<path d="M108 176 L119 91 L139 176Z" fill="#66c4ef" stroke="#1e4960" stroke-width="5"/><path d="M136 178 L151 113 L172 178Z" fill="#8ad9ff" stroke="#1e4960" stroke-width="5"/><path d="M80 179 L100 122 L118 179Z" fill="#3f9ac3" stroke="#1e4960" stroke-width="5"/>`;
  }
  if (kind === "worker") {
    return `${shadow}<ellipse cx="128" cy="80" rx="19" ry="22" fill="#b77a4a" stroke="#412719" stroke-width="4"/><path d="M103 109 C114 96 141 96 153 109 L145 164 C134 173 120 173 109 164Z" fill="#3b6b37" stroke="#1f2f1b" stroke-width="5"/><path d="M109 164 L99 202 M145 164 L156 202" stroke="#392719" stroke-width="10" stroke-linecap="round"/><path d="M105 121 L72 141 M151 121 L184 111" stroke="#b77a4a" stroke-width="10" stroke-linecap="round"/><path d="M177 103 L201 127" stroke="#7f5130" stroke-width="7" stroke-linecap="round"/><path d="M193 97 C214 100 222 115 202 126" fill="none" stroke="${palette.iron}" stroke-width="8" stroke-linecap="round"/>`;
  }
  return `${shadow}<path d="M128 52 L181 180 H75Z" fill="#2f6638" stroke="#16351b" stroke-width="6"/><path d="M128 28 L170 133 H86Z" fill="#3f8545" stroke="#16351b" stroke-width="6"/><rect x="117" y="166" width="22" height="38" rx="5" fill="#774620" stroke="#321e10" stroke-width="4"/>`;
}

async function main() {
  for (const dir of dirs) await mkdir(path.join(outRoot, dir), { recursive: true });

  for (const [name, body] of Object.entries(itemBodies)) {
    await renderSvg(`inventory-icons/${name}.png`, 128, 128, iconFrame(body));
  }

  for (const [name, body] of Object.entries(skillBodies)) {
    await renderSvg(`skill-icons/${name}.png`, 128, 128, iconFrame(body));
  }

  await renderSvg("ui/panel-frame.png", 512, 512, `
    <rect x="10" y="10" width="492" height="492" rx="24" fill="url(#panelGrad)" stroke="${palette.edge}" stroke-width="10" filter="url(#shadow)"/>
    <rect x="30" y="32" width="452" height="448" rx="16" fill="#100a06" opacity=".72" stroke="#000" stroke-width="4"/>
    <path d="M48 58 H464 M48 454 H464" stroke="${palette.gold}" stroke-width="3" opacity=".55"/>
    <circle cx="58" cy="58" r="14" fill="${palette.gold}" opacity=".35"/><circle cx="454" cy="58" r="14" fill="${palette.gold}" opacity=".35"/><circle cx="58" cy="454" r="14" fill="${palette.gold}" opacity=".35"/><circle cx="454" cy="454" r="14" fill="${palette.gold}" opacity=".35"/>`);
  await renderSvg("ui/button-normal.png", 256, 80, `
    <rect x="8" y="8" width="240" height="64" rx="10" fill="url(#panelGrad)" stroke="${palette.edge}" stroke-width="5" filter="url(#shadow)"/>
    <path d="M25 24 H231" stroke="${palette.gold2}" stroke-width="2" opacity=".32"/>
    <text x="128" y="50" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="22" font-weight="700" fill="${palette.parchment}">Button</text>`);
  await renderSvg("ui/button-active.png", 256, 80, `
    <rect x="8" y="8" width="240" height="64" rx="10" fill="#4a2f17" stroke="${palette.gold2}" stroke-width="5" filter="url(#shadow)"/>
    <path d="M25 24 H231" stroke="#fff7bf" stroke-width="3" opacity=".45"/>
    <text x="128" y="50" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="22" font-weight="700" fill="${palette.gold2}">Button</text>`);
  await renderSvg("ui/inventory-slot.png", 128, 128, `
    <rect x="8" y="8" width="112" height="112" rx="10" fill="#100a06" stroke="${palette.edge}" stroke-width="4"/>
    <rect x="18" y="18" width="92" height="92" rx="8" fill="#090604" stroke="#000" stroke-width="2"/>
    <path d="M24 24 H104 V104" stroke="#fff2bd" stroke-width="2" opacity=".08"/>`);

  for (const [name, bg, accent, letter] of portraitData) {
    await renderSvg(`quest-portraits/${name}.png`, 256, 256, `
      <rect x="8" y="8" width="240" height="240" rx="22" fill="url(#panelGrad)" stroke="${palette.edge}" stroke-width="7" filter="url(#shadow)"/>
      <circle cx="128" cy="102" r="54" fill="${bg}" stroke="#160f0a" stroke-width="7"/>
      <ellipse cx="128" cy="89" rx="30" ry="34" fill="#b98255" stroke="#3b2114" stroke-width="5"/>
      <path d="M74 202 C82 156 101 131 128 131 C155 131 176 156 183 202Z" fill="${accent}" stroke="#2a1a10" stroke-width="6"/>
      <path d="M85 62 C108 28 151 28 173 62 C152 51 108 51 85 62Z" fill="#111" opacity=".38"/>
      <text x="128" y="224" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="700" fill="${palette.gold2}">${letter}</text>`);
  }

  for (const [name, title, subtitle, color] of signData) {
    await renderSvg(`shop-signs/${name}.png`, 512, 192, `
      <rect x="24" y="28" width="464" height="136" rx="15" fill="${color}" stroke="#2a180c" stroke-width="10" filter="url(#shadow)"/>
      <path d="M52 58 H460 M52 134 H460" stroke="#d7a566" stroke-width="4" opacity=".55"/>
      <text x="256" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="50" font-weight="700" fill="${palette.gold2}">${title}</text>
      <text x="256" y="134" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="20" fill="${palette.parchment}">${subtitle}</text>`);
  }

  const cards = [
    ["copper-ore-card", "Copper Ore", "Quarrying", itemBodies.copper_ore],
    ["aether-stalk-card", "Aether Stalk", "Reaping", itemBodies.aether_stalk],
    ["minor-tonic-card", "Minor Tonic", "Distilling", itemBodies.minor_tonic],
    ["field-scroll-card", "Field Scroll", "Quest", itemBodies.field_scroll],
    ["proof-gem-card", "Proof Gem", "Sealing", itemBodies.proof_gem],
    ["pickaxe-card", "Bronze Pickaxe", "Tool", itemBodies.pickaxe],
  ];
  for (const [file, title, subtitle, body] of cards) {
    await renderSvg(`item-cards/${file}.png`, 256, 352, itemCard(file, title, subtitle, body));
  }

  for (const [name, base, dark, light] of textureData) {
    await renderSvg(`textures/${name}.png`, 256, 256, textureBody(base, dark, light));
  }

  for (const [name, kind] of isoSprites) {
    await renderSvg(`isometric-sprites/${name}.png`, 256, 256, isoBody(kind));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    method: "Procedural SVG source rendered to PNG with ImageMagick. Source SVGs are retained for iteration.",
    folders: dirs.filter((dir) => !dir.startsWith("_")),
    counts: {
      inventoryIcons: Object.keys(itemBodies).length,
      skillIcons: Object.keys(skillBodies).length,
      ui: 4,
      questPortraits: portraitData.length,
      shopSigns: signData.length,
      itemCards: cards.length,
      textures: textureData.length,
      isometricSprites: isoSprites.length,
    },
  };
  await writeFile(path.join(outRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

await main();
