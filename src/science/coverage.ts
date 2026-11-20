import type { ElementRecord } from "@/data/elements";
import { hfDatasetFor } from "./providers";

/** Preferred neutral-atom result, not the user's optional one-electron-ion model. */
export function coverage(e: ElementRecord) {
  const hf = hfDatasetFor(e.Z);
  const orbital = e.Z === 1 ? "hydrogenic-exact" : "browser-slater";
  return {
    orbital, subshellDensity: orbital, orbitalMoment: orbital,
    phase: orbital, current: orbital,
    totalDensity: e.Z === 1 ? orbital : hf ? "pyscf-hf" : orbital,
    totalEnergy: e.Z === 1 ? "hydrogenic-exact" : hf ? "pyscf-hf" : null,
    orbitalEigenvalue: e.Z === 1 ? orbital : null,
    heavyRelativistic: null, termAndJ: e.groundLevel,
    evidence: e.Z === 1 ? "analytic-exact-within-stated-Hamiltonian" : hf ? "computed-basis-limited" : "qualitative-approximation",
  } as const;
}
