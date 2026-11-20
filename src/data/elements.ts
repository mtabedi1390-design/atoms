import neutral from "./neutral.json";

export type ElementCategory =
  | "alkali metal"
  | "alkaline earth metal"
  | "transition metal"
  | "post-transition metal"
  | "metalloid"
  | "reactive nonmetal"
  | "noble gas"
  | "lanthanide"
  | "actinide"
  | "unknown properties";

export type Block = "s" | "p" | "d" | "f";
export type Evidence = "measured" | "evaluated" | "semi-empirical" | "theoretical" | "predicted" | "unavailable";

export interface Provenanced<T> {
  readonly value: T;
  readonly evidence: Evidence;
  readonly source: string;
  readonly note?: string;
}

export interface Subshell {
  readonly n: number;
  readonly l: number;
  readonly occupancy: number; // electrons in this subshell (0 … 2(2l+1))
  readonly label: string;
}

export interface ElementRecord {
  readonly Z: number;
  readonly symbol: string;
  readonly name: string;
  readonly mass: Provenanced<number>; // dimensionless relative weight or integer A
  readonly massKind: "standard atomic weight" | "representative isotope mass number";
  readonly category: ElementCategory;
  readonly group: number | null; // null for inner-transition rows
  readonly period: number;
  readonly block: Block;
  readonly configuration: Provenanced<string>; // noble-gas shorthand
  readonly groundLevel: string | null; // source notation includes J; * denotes odd parity
  readonly subshells: readonly Subshell[]; // full, ordered by (n, l)
  readonly ionizationEnergy_eV: Provenanced<number | null>;
  readonly covalentRadius_pm: Provenanced<number | null>;
}

// Descriptive UI taxonomy retained from the baseline; not an evaluated observable.
const CATEGORIES: Record<string, ElementCategory> = {
  H: "reactive nonmetal",
  He: "noble gas",
  Li: "alkali metal",
  Be: "alkaline earth metal",
  B: "metalloid",
  C: "reactive nonmetal",
  N: "reactive nonmetal",
  O: "reactive nonmetal",
  F: "reactive nonmetal",
  Ne: "noble gas",
  Na: "alkali metal",
  Mg: "alkaline earth metal",
  Al: "post-transition metal",
  Si: "metalloid",
  P: "reactive nonmetal",
  S: "reactive nonmetal",
  Cl: "reactive nonmetal",
  Ar: "noble gas",
  K: "alkali metal",
  Ca: "alkaline earth metal",
  Sc: "transition metal",
  Ti: "transition metal",
  V: "transition metal",
  Cr: "transition metal",
  Mn: "transition metal",
  Fe: "transition metal",
  Co: "transition metal",
  Ni: "transition metal",
  Cu: "transition metal",
  Zn: "transition metal",
  Ga: "post-transition metal",
  Ge: "metalloid",
  As: "metalloid",
  Se: "reactive nonmetal",
  Br: "reactive nonmetal",
  Kr: "noble gas",
  Rb: "alkali metal",
  Sr: "alkaline earth metal",
  Y: "transition metal",
  Zr: "transition metal",
  Nb: "transition metal",
  Mo: "transition metal",
  Tc: "transition metal",
  Ru: "transition metal",
  Rh: "transition metal",
  Pd: "transition metal",
  Ag: "transition metal",
  Cd: "transition metal",
  In: "post-transition metal",
  Sn: "post-transition metal",
  Sb: "metalloid",
  Te: "metalloid",
  I: "reactive nonmetal",
  Xe: "noble gas",
  Cs: "alkali metal",
  Ba: "alkaline earth metal",
  La: "lanthanide",
  Ce: "lanthanide",
  Pr: "lanthanide",
  Nd: "lanthanide",
  Pm: "lanthanide",
  Sm: "lanthanide",
  Eu: "lanthanide",
  Gd: "lanthanide",
  Tb: "lanthanide",
  Dy: "lanthanide",
  Ho: "lanthanide",
  Er: "lanthanide",
  Tm: "lanthanide",
  Yb: "lanthanide",
  Lu: "lanthanide",
  Hf: "transition metal",
  Ta: "transition metal",
  W: "transition metal",
  Re: "transition metal",
  Os: "transition metal",
  Ir: "transition metal",
  Pt: "transition metal",
  Au: "transition metal",
  Hg: "transition metal",
  Tl: "post-transition metal",
  Pb: "post-transition metal",
  Bi: "post-transition metal",
  Po: "post-transition metal",
  At: "metalloid",
  Rn: "noble gas",
  Fr: "alkali metal",
  Ra: "alkaline earth metal",
  Ac: "actinide",
  Th: "actinide",
  Pa: "actinide",
  U: "actinide",
  Np: "actinide",
  Pu: "actinide",
  Am: "actinide",
  Cm: "actinide",
  Bk: "actinide",
  Cf: "actinide",
  Es: "actinide",
  Fm: "actinide",
  Md: "actinide",
  No: "actinide",
  Lr: "actinide",
  Rf: "transition metal",
  Db: "transition metal",
  Sg: "transition metal",
  Bh: "transition metal",
  Hs: "transition metal",
  Mt: "unknown properties",
  Ds: "unknown properties",
  Rg: "unknown properties",
  Cn: "transition metal",
  Nh: "unknown properties",
  Fl: "post-transition metal",
  Mc: "unknown properties",
  Lv: "unknown properties",
  Ts: "unknown properties",
  Og: "unknown properties",
};

const NOBLE = [2, 10, 18, 36, 54, 86];
function buildSubshells(Z: number): Subshell[] {
  const occupations: Record<string, number> = neutral[Z-1].occupied as Record<string, number>;
  return Object.entries(occupations).map(([label, occupancy]) => ({
    label, occupancy, n: Number(label[0]), l: "spdf".indexOf(label[1]),
  })).sort((a,b) => a.n-b.n || a.l-b.l);
}

function configString(Z: number, subs: readonly Subshell[]): string {
  const core = [...NOBLE].reverse().find((g) => g < Z);
  if (!core) return subs.map((s) => `${s.label}${s.occupancy}`).join(" ");
  const coreSubs = buildSubshells(core);
  const coreKey = new Map(coreSubs.map((s) => [`${s.n}${s.l}`, s.occupancy]));
  const coreSym = neutral[core - 1].symbol;
  const rest = subs
    .filter((s) => (coreKey.get(`${s.n}${s.l}`) ?? 0) !== s.occupancy)
    .map((s) => `${s.label}${s.occupancy}`);
  return `[${coreSym}] ${rest.join(" ")}`;
}

const SRC_NIST = "mendeleev 1.3.0 neutral ionizationenergies (NIST ASD), Ground Levels and Ionization Energies for the Neutral Atoms (physics.nist.gov/PhysRefData/ASD/ionEnergy.html)";
const SRC_IUPAC = "CIAAW 2021 via periodictable 2.1.0 element_mass";
const SRC_CORDERO = "mendeleev 1.3.0 covalent_radius_cordero (averages for C, Mn, Fe, Co); Cordero et al., Dalton Trans. 2008, 2832–2838 (covalent radii)";

export const ELEMENTS: readonly ElementRecord[] = neutral.map((data) => {
  const {Z, symbol, name, group, period} = data;
  const category = CATEGORIES[symbol];
  if (!category) throw new Error(`Missing category for ${symbol}`);
  const subshells = buildSubshells(Z);
  const stdMass = data.weight !== "-";
  const {mass, ie, radius: rcov} = data;
  const predicted = Z >= 104;
  return {
    Z,
    symbol,
    name,
    mass: {
      value: mass,
      evidence: "evaluated",
      source: stdMass ? `${SRC_IUPAC}: ${data.weight}` : "periodictable 2.1.0 nominal mass number (not an isotopic mass or current lifetime ranking)",
    },
    massKind: stdMass ? "standard atomic weight" : "representative isotope mass number",
    category,
    group,
    period,
    block: data.block as Block,
    configuration: {
      value: configString(Z, subshells),
      evidence: predicted ? "predicted" : "evaluated",
      source: Z > 108 ? "mendeleev 1.3.0 predicted configuration; method not specified" : SRC_NIST,

    },
    groundLevel: data.level,
    subshells,
    ionizationEnergy_eV: {
      value: ie,
      evidence: ie === null ? "unavailable" : data.ieKind === "theoretical" ? "theoretical" : data.ieKind === "semi-empirical" ? "semi-empirical" : "evaluated",
      source: ie === null ? "No evaluated experimental value" : SRC_NIST,
      note: `${data.ieKind}; uncertainty ${data.uncertainty ?? "unavailable"} eV; refs ${data.references ?? "—"}`,
    },
    covalentRadius_pm: {
      value: rcov,
      evidence: rcov === null ? "unavailable" : "evaluated",
      source: rcov === null ? "Not tabulated by Cordero et al." : SRC_CORDERO,
    },
  };
});

export function elementByZ(Z: number): ElementRecord {
  const e = ELEMENTS[Z - 1];
  if (!e || e.Z !== Z) throw new RangeError(`No element with Z=${Z}`);
  return e;
}

export function electronCount(e: ElementRecord): number {
  return e.subshells.reduce((s, x) => s + x.occupancy, 0);
}

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  "alkali metal": "#e4572e",
  "alkaline earth metal": "#f3a712",
  "transition metal": "#5b8def",
  "post-transition metal": "#6bc5a0",
  metalloid: "#a1c349",
  "reactive nonmetal": "#f2d16b",
  "noble gas": "#c77dff",
  lanthanide: "#ff85a1",
  actinide: "#ff6b6b",
  "unknown properties": "#6b7280",
};

export const BLOCK_COLORS: Record<Block, string> = { s: "#e4572e", p: "#f3a712", d: "#5b8def", f: "#ff85a1" };
