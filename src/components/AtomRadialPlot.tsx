import { useMemo } from "react";
import type { ElementRecord } from "@/data/elements";
import { BOHR_PM, radialExtent, radialPDF } from "@/physics/hydrogenic";
import { effectiveZ, type ModelId } from "@/physics/models";
import type { HFDataset } from "@/science/providers";

/** A radial electron count, not an orbital probability or ρ per unit volume. */
export function AtomRadialPlot({ element, model, hf }: { element: ElementRecord; model: ModelId; hf: HFDataset | null }) {
  const { path, integral, extent, peak } = useMemo(() => {
    const shells = element.subshells.map(s => ({ ...s, z: effectiveZ(model, element, s) }));
    const limit = Math.max(...shells.map(s => radialExtent(s.n,s.l,s.z)));
    // Quadratic spacing resolves compact inner shells without truncating diffuse valence shells.
    const r = hf?.density.rBohr ?? Array.from({length: 2049}, (_,i) => limit*(i/2048)**2);
    const y = r.map((x,i) => hf ? 4*Math.PI*x*x*hf.density.rhoElectronPerBohr3[i] : shells.reduce((v,s) => v+s.occupancy*radialPDF(s.n,s.l,x,s.z),0));
    const peak = Math.max(...y), extent = r[r.length-1];
    const integral = r.slice(1).reduce((v,x,i) => v+(x-r[i])*(y[i]+y[i+1])/2,0);
    const path = r.map((x,i) => `${i?'L':'M'}${(8+304*x/extent).toFixed(2)},${(126-116*y[i]/peak).toFixed(2)}`).join(' ');
    return { path, integral, extent, peak };
  }, [element, model, hf]);
  return <figure className="text-xs text-zinc-400"><figcaption>All electrons · {hf ? `${hf.method}/${hf.basis}` : model} · 4πr²ρ(r)</figcaption>
    <svg role="img" aria-label="Total radial electron distribution" viewBox="0 0 320 135"><path d="M8 8V126H312" fill="none" stroke="#52525b"/><path d={path} stroke="#67e8f9" fill="none"/></svg>
    <p>r: 0–{(extent*BOHR_PM).toFixed(1)} pm · peak {(peak/BOHR_PM).toPrecision(3)} e/pm</p><p>∫4πr²ρ dr = {integral.toFixed(4)} e (neutral Z = {element.Z}). Visibility does not change this total.</p></figure>;
}
