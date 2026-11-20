#!/usr/bin/env python3
"""
Offline higher-accuracy pathway: non-relativistic restricted Hartree–Fock (RHF/ROHF)
with PySCF, exported as spherically averaged radial electron densities for the browser.

This does not run in the browser and is NOT part of the interactive path.  It is a
reproducible calculation whose output is validated and bundled:

    python3 science/hf_export.py

Output: src/data/hf/<Symbol>.json  (schema atoms.hf-radial.v1)

Scope and honesty:
  * Method: RHF (closed shell) / ROHF (open shell), point nucleus, non-relativistic.
  * Basis: aug-cc-pVTZ (basis-set error is reported against the numerical HF limit;
    these are NOT basis-set-limit values, and they are NOT experimental energies).
  * Density: ρ(r) = (1/4π)∮ρ(r,Ω)dΩ on a Lebedev angular quadrature, on a
    logarithmic radial grid.  Integrated electron count is checked against Z.
  * Correlation: none.  Relativistic effects: none.  Fine structure: not computed.
"""
import json
import os
from datetime import date

import numpy as np
import pyscf
from pyscf import gto, scf
from pyscf.dft.gen_grid import MakeAngularGrid

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "hf")
BASIS = "aug-cc-pVTZ"
N_ANG = 110
ANGULAR_GRID = MakeAngularGrid(N_ANG)
N_RAD = 840
R_MIN, R_MAX = 1.0e-3, 48.0

# Non-relativistic numerical Hartree–Fock limits for comparison only.
HF_LIMIT = {
    'Na': -161.85891151, 'Mg': -199.61463627, 'Al': -241.876707201, 'Si': -288.854362454, 'P': -340.718780875, 'S': -397.504895877, 'Cl': -459.482072328, 'Ar': -526.817512711,
    "H": -0.5,
    "Li": -7.432727, "Be": -14.573023, "B": -24.529061, "F": -99.409349,
    "He": -2.8616799956,
    "C": -37.6886189594,
    "N": -54.4009342052,
    "O": -74.8093984657,
    "Ne": -128.5470981090,
}
ATOMS = [
    # symbol, Z, spin (2S), charge, term
    ("H", 1, 1, 0, "2S"),
    ("Li", 3, 1, 0, "2S"), ("Be", 4, 0, 0, "1S"),
    ("B", 5, 1, 0, "2P"), ("F", 9, 1, 0, "2P"),
    ("He", 2, 0, 0, "1S"),
    ("C", 6, 2, 0, "3P"),
    ("N", 7, 3, 0, "4S"),
    ("O", 8, 2, 0, "3P"),
    ("Ne", 10, 0, 0, "1S"),
    ("Na", 11, 1, 0, "2S"),
    ("Mg", 12, 0, 0, "1S"),
    ("Al", 13, 1, 0, "2P"),
    ("Si", 14, 2, 0, "3P"),
    ("P", 15, 3, 0, "4S"),
    ("S", 16, 2, 0, "3P"),
    ("Cl", 17, 1, 0, "2P"),
    ("Ar", 18, 0, 0, "1S"),

]
CONFIG = {
    'Na': '[Ne] 3s1', 'Mg': '[Ne] 3s2', 'Al': '[Ne] 3s2 3p1', 'Si': '[Ne] 3s2 3p2', 'P': '[Ne] 3s2 3p3', 'S': '[Ne] 3s2 3p4', 'Cl': '[Ne] 3s2 3p5', 'Ar': '[Ne] 3s2 3p6',
    "Li": "[He] 2s1", "Be": "[He] 2s2", "B": "[He] 2s2 2p1", "F": "[He] 2s2 2p5", "H": "1s1", "He": "1s2", "C": "[He] 2s2 2p2", "N": "[He] 2s2 2p3", "O": "[He] 2s2 2p4", "Ne": "[He] 2s2 2p6"}


def radial_grid(r_max):
    # geometric grid, denser near the nucleus
    return np.geomspace(R_MIN, r_max, N_RAD)


def spherical_density(mol, dm, r):
    pts = ANGULAR_GRID[:, :3] * r
    ao = mol.eval_gto("GTOval_sph", pts)
    if dm.ndim == 3:
        rho = sum(np.einsum("pi,ij,pj->p", ao, dm[s], ao) for s in range(dm.shape[0]))
    else:
        rho = np.einsum("pi,ij,pj->p", ao, dm, ao)
    return float(ANGULAR_GRID[:, 3] @ rho)


def integrate_electrons(r, rho):
    return float(np.trapezoid(4 * np.pi * r * r * rho, r))


def solve(sym, spin, charge, basis):
    mol = gto.M(atom=f"{sym} 0 0 0", basis=basis, unit="Bohr", charge=charge, spin=spin, verbose=0)
    mf = scf.RHF(mol) if spin == 0 else scf.ROHF(mol)
    mf.conv_tol = 1e-10
    mf.kernel()
    if not mf.converged:
        raise RuntimeError(f"SCF did not converge for {sym}/{basis}")
    return mol, mf


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    summary = []
    for sym, Z, spin, charge, term in ATOMS:
        mol, mf = solve(sym, spin, charge, BASIS)
        energy = mf.e_tot
        dm = mf.make_rdm1()
        r_max = R_MAX
        r = radial_grid(r_max)
        rho = np.array([spherical_density(mol, dm, ri) for ri in r])
        count = integrate_electrons(r, rho)
        # tail/extent expansion check
        expansions = 0
        while abs(count - Z) > 2e-3 and expansions < 4:
            r_max *= 1.4
            r = radial_grid(r_max)
            rho = np.array([spherical_density(mol, dm, ri) for ri in r])
            count = integrate_electrons(r, rho)
            expansions += 1
        if abs(count - Z) > 2e-3:
            raise RuntimeError(f"{sym}: integrated electron count {count:.5f} ≠ Z={Z}")
        # Independent basis sensitivity check (not a rigorous error bound).
        small_mol, small = solve(sym, spin, charge, "aug-cc-pVDZ")
        small_dm = small.make_rdm1()
        small_rho = np.array([spherical_density(small_mol, small_dm, ri) for ri in r])
        delta_density = integrate_electrons(r, np.abs(small_rho - rho))
        ref = HF_LIMIT[sym]
        if not (-2e-4 <= energy - ref < 0.02):
            raise RuntimeError(f"{sym}: total energy inconsistent with numerical HF reference")
        rec = {
            "schema": "atoms.hf-radial.v1",
            "generated": date.today().isoformat(),
            "engine": {"name": "PySCF", "version": pyscf.__version__, "license": "Apache-2.0", "url": "https://pyscf.org"},
            "method": "RHF" if spin == 0 else "ROHF",
            "hamiltonian": "non-relativistic Coulomb, point nucleus, Born–Oppenheimer (isolated atom)",
            "basis": BASIS,
            "correlation": "none (Hartree–Fock)",
            "relativistic": "none",
            "term": term,
            "spin2S": spin,
            "charge": charge,
            "atom": {"Z": Z, "symbol": sym, "configuration": CONFIG[sym]},
            "energy_hartree": float(energy),
            "energy_eV": float(energy * 27.211386245988),
            "reference": {
                "property": "published finite STO HF energy" if Z > 10 else "total non-relativistic HF energy (basis-set limit)",
                "value_hartree": ref,
                "source": "Koga et al., Analytical Hartree–Fock wave functions subject to cusp and asymptotic constraints, neutral STO energies via AtomDB ef573b09 atomdb/data/slater_atom.tar.xz" if Z > 10 else "Numerical HF limit (literature; e.g. Koga & Thakkar, Phys. Rev. A 71, 022502 (2005) and references therein)",
                "note": "Difference from the stated HF reference; not a correlation energy or rigorous density error bound.",
            },
            "basisError_hartree": float(energy - ref),
            "basisSensitivity": {"comparisonBasis": "aug-cc-pVDZ", "energyHartree": float(small.e_tot), "radialDensityL1Electrons": delta_density},
            "scf": {"converged": bool(mf.converged), "cycles": int(mf.cycles), "convergenceTol": float(mf.conv_tol)},
            "density": {
                "definition": "spherically averaged one-electron density of the HF determinant, electrons/bohr^3",
                "rBohr": [float(x) for x in r],
                "rhoElectronPerBohr3": [float(x) for x in rho],
                "anglePoints": N_ANG,
                "angleGrid": "Lebedev (PySCF), normalized solid-angle weights",
                "quadrature": "trapezoid on non-uniform log radial grid",
                "integratedElectrons": count,
                "electronCountTolerance": 2e-3,
                "extensions": expansions,
            },
            "knownLimitations": [
                "Hartree–Fock: no electron correlation",
                "Non-relativistic: unsuitable for quantitative heavy-atom densities",
                "Finite Gaussian basis: not the HF basis-set limit",
                "Spherical average of a scalar determinant density; spin density not exported",
                "No subshell-resolved radial functions are exported by this pipeline",
            ],
            "command": "python3 science/hf_export.py",
        }
        path = os.path.join(OUT_DIR, f"{sym}.json")
        with open(path, "w") as f:
            json.dump(rec, f, indent=1)
        summary.append((sym, energy, ref, count))
        print(f"{sym:>3}  E={energy: .8f} Ha  ref={ref: .8f}  Δ={energy-ref:+.5f} Ha  ∫ρ={count:.5f}e  -> {path}")
    print("done")


if __name__ == "__main__":
    main()
