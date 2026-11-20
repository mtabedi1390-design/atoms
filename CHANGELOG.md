# Changelog

## 0.5.0 — Atomic visualization and data provenance

- Rebuilt neutral configurations, levels/J, first ionization energies and flags, mass conventions, group/block metadata and covalent radii from two checksum-pinned secondary distributions. Preserved the descriptive UI taxonomy. Adopted the source's Ds and Rg predictions rather than filling those orbitals by rule.
- Expanded offline all-electron PySCF HF from six elements to H–Ar. Recomputed densities with Lebedev averaging, a finer radial grid and a separate double-zeta sensitivity calculation. Compared every export against an independently tabulated radial density.
- Neutral H defaults to the analytic model; full He–Ar to HF. Model layers remain available. Restored the distinction between an ion orbital and a neutral total density when switching modes. Density-only mode no longer carries phase colors, current controls, orbital radii or Slater energies into HF analysis.
- Added a total radial electron-count plot, corrected complex-orbital node labels, replaced a zoom-independent pseudo-ruler with physical framing information, and separated worker/CDF, delivery and buffer-staging timings.
- Added the per-element coverage matrix, profile validation table, reproducible import/generation commands, user/developer guides and all-element navigation coverage. Removed the runtime font-network dependency.

**Migration:** no persisted user schema or backend migration. Default density source changed for supported atoms. The nominal isotope field is a mass number, not a mass in u. Existing URLs with `z`, `mode`, `samples` and `adaptive` still work. No validated relativistic or correlated data were added; the remaining 100 neutral atoms have qualitative rather than quantitative total-density coverage.
