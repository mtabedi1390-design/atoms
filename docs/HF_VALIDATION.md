# HF radial-profile comparisons

Raw reference: AtomDB `numeric`, commit `ef573b09a0e96f73857d4d8b263590484777364a`. These are model comparisons, **not** measurements or error bars. The numerical reference and ROHF open-shell state/averaging conventions need not coincide. We interpolate reference ρ onto the export grid (linear in r), then report ∫4πr²|Δρ| dr / Z. The DZ comparison substitutes an independent aug-cc-pVDZ SCF calculation for the reference. The density is never rescaled to force agreement.

| Z | Atom | Electron-count residual (e) | Profile difference / Z | DZ–TZ difference / Z | ΔE vs HF reference (Ha) |
|---:|---|---:|---:|---:|---:|
| 1 | H | +0.000028 | 0.005813 | 0.011772 | +0.000179 |
| 2 | He | +0.000055 | 0.004901 | 0.015291 | +0.000497 |
| 3 | Li | +0.000082 | 0.004260 | 0.001362 | +0.000045 |
| 4 | Be | +0.000110 | 0.004149 | 0.004607 | +0.000148 |
| 5 | B | +0.000137 | 0.004646 | 0.005344 | +0.000859 |
| 6 | C | +0.000165 | 0.008003 | 0.007999 | +0.001782 |
| 7 | N | +0.000192 | 0.013762 | 0.010331 | +0.003325 |
| 8 | O | +0.000219 | 0.007006 | 0.012620 | +0.002890 |
| 9 | F | +0.000246 | 0.007052 | 0.014565 | +0.007266 |
| 10 | Ne | +0.000273 | 0.007382 | 0.016098 | +0.013825 |
| 11 | Na | +0.000299 | 0.004056 | 0.002763 | +0.000913 |
| 12 | Mg | +0.000326 | 0.003983 | 0.002452 | +0.001286 |
| 13 | Al | +0.000352 | 0.005050 | 0.002749 | +0.001421 |
| 14 | Si | +0.000378 | 0.005830 | 0.004078 | +0.002005 |
| 15 | P | +0.000404 | 0.008899 | 0.005683 | +0.002657 |
| 16 | S | +0.000429 | 0.004891 | 0.006319 | +0.000891 |
| 17 | Cl | +0.000455 | 0.004651 | 0.005422 | +0.001874 |
| 18 | Ar | +0.000480 | 0.004698 | 0.004347 | +0.004161 |
