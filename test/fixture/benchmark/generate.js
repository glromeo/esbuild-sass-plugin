const {readFileSync, writeFileSync, mkdirSync} = require("fs");
const {join, dirname} = require("path");

function saveGeneratedFile(filename, contents) {
    let pathname = join(__dirname, "src/generated", filename);
    try {
        mkdirSync(dirname(pathname), {recursive: true});
    } catch (ignored) {
    }
    writeFileSync(pathname, contents);
}

const alphabet = [
    ["Alpha", "α", "Α"],
    ["Beta", "β", "Β"],
    ["Gamma", "γ", "Γ"],
    ["Delta", "δ", "Δ"],
    ["Epsilon", "ε", "Ε"],
    ["Zeta", "ζ", "Ζ"],
    ["Eta", "η", "Η"],
    ["Theta", "θ", "Θ"],
    ["Iota", "ι", "Ι"],
    ["Kappa", "κ", "Κ"],
    ["Lambda", "λ", "Λ"],
    ["Mu", "μ", "Μ"],
    ["Nu", "ν", "Ν"],
    ["Xi", "ξ", "Ξ"],
    ["Omicron", "ο", "Ο"],
    ["Pi", "π", "Π"],
    ["Rho", "ρ", "Ρ"],
    ["Sigma", "σ", "Σ"],
    ["Tau", "τ", "Τ"],
    ["Upsilon", "υ", "Υ"],
    ["Phi", "φ", "Φ"],
    ["Chi", "χ", "Χ"],
    ["Psi", "ψ", "Ψ"],
    ["Omega", "ω", "Ω"]
];

const catchphrases = JSON.parse(readFileSync("./catchphrases.json", "utf-8"));
const colors = Object.keys(JSON.parse(readFileSync("./css-colors.json", "utf-8")));
const colorValues = Object.values(JSON.parse(readFileSync("./css-colors.json", "utf-8")));

const tile = (row, col, r, c) => `
import {customElement, html, LitElement, property} from "lit-element";

import bootstrap from "bootstrap/scss/bootstrap.scss";
import styles from "./style_${r * 24 + c}.scss";

@customElement("tile-${row[2]}${col[2]}")
export default class Tile${row[0]}${col[0]} extends LitElement {

    @property() title = "${catchphrases[Math.floor(Math.random() * catchphrases.length)].replace(/"/g, "\\\"")}";

    static styles = [bootstrap, styles]

    render() {
        return html\`
            <div class="tile d-flex flex-column" title=\${this.title}>
                <div class="d-flex flex-row">
                    <div class="letter">${row[1]}</div>
                    <div class="letter">${col[2]}</div>
                </div>
                <div class="number">${r * 24 + c}</div>
            </div>
        \`;
    }
}
`;

const line = (row, r) => `
/**
 * Row
 */
${alphabet.map((col, c) => {
    saveGeneratedFile(`./${row[2]}/${col[1]}/tile_${r * 24 + c}.ts`, tile(row, col, r, c));
    saveGeneratedFile(`./${row[2]}/${col[1]}/style_${r * 24 + c}.scss`, `
        .tile {
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            background-color: lighten(${colors[Math.floor(Math.random() * colors.length)]}, 20%);
            border: 4px solid darken(${colors[Math.floor(Math.random() * colors.length)]}, 20%);
            margin: 1px;
            .letter {
                padding: 10px;
                font-size: 15px;
            }
        }
        .number {
            padding: 10px;
            font-size: 20px;
        }
    `);
    return `import "./${col[1]}/tile_${r * 24 + c}.ts";`;
}).join("\n")}
`;

const grid = `
import {customElement, html, LitElement, property} from "lit-element";

/**
 * Grid
 */
${alphabet.map((row, r) => {
    let filename = `./${row[2]}/index.ts`;
    saveGeneratedFile(filename, line(row, r));
    return `import "${filename}";`;
}).join("\n")}

import "../index.scss"; // TODO: resolve bootstrap to the same scss module

@customElement("benchmark-component")
class BenchmarkComponent extends LitElement {

    createRenderRoot() {
      return this;
    }

    render() {
        return html\`
            <div class="d-flex flex-column">${alphabet.map((row, r) => `
                <div class="d-flex flex-row"> ${alphabet.map((col, c) => `
                    <tile-${row[2]}${col[2]}></tile-${row[2]}${col[2]}>`).join("")}
                </div>`).join("")}
            </div>\`;
    }
}
`;

saveGeneratedFile("./index.ts", grid);

