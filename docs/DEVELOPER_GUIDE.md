# Developing and reproducing ATOMS

**Runtime.** Vite resolves `@/` to `src/`. `state/appState.ts` enforces system/mode invariants. `App.tsx` turns the selection into per-layer sampling requests. The React controls, radial plots and inspector are independent of WebGL. `physics/` implements normalized radial functions, harmonics, density and current in atomic units. `native/quantum_core.hpp` is separately built for reference tests; changing it alone does not change the browser.

**Worker/renderer contract.** Each request has a monotonically increasing ID and layer slot; stale completion is discarded in `sampling/client.ts`. The synchronous worker can drop queued jobs but cannot interrupt a computation while its event loop is blocked. Its bounded table cache keys include model, basis, n/l/m, charge, mixture and tabulated-data identity; count/seed change samples, not the CDF. The worker transfers Float32 xyz (a₀), density (a₀⁻³ or e/a₀³) and a phase channel (ignored for density-only layers). Positions are converted once to pm at GPU-buffer staging. `OrbitalScene` owns/disposes geometry/materials, applies world-space clipping and shared peak normalization. Delivery timing includes scheduling; staging is not a hardware GPU timer.

**Adding data.** Update the wheel pin, checksum and deterministic transform together; review changed records before replacing a snapshot. Distinguish missing from zero. Preserve source flags and check expanded occupations against Z independently of shorthand. Update `docs/DATA.md`, tests and the generated matrix. Do not change a radius convention or substitute isotope mass for A without changing metadata.

**Adding a provider.** First specify the observable (signed R, angular basis, total density, energy, etc.), system, units, Hamiltonian, nuclear model, state averaging and validation target. Implement `supports` and `compute` in `science/providers.ts`, register the selection priority, and cover unavailable as well as success paths. The generated `docs/coverage.json` is the machine-readable matrix and HF manifest; each non-null `hfDataset` points to the calculation metadata. Update `science/coverage.ts`, matrix generation, state and inspector together. A tabulated total density cannot feed orbital phase/current. A relativistic spinor would require a schema distinct from `atoms.hf-radial.v1`. Test absolute electron-count integrals, reference deviations, finite values and convergence *before* allowing selection. Energy comparison alone is not density validation.

## Recompute offline HF

```sh
python3 -m venv /tmp/atoms-hf
/tmp/atoms-hf/bin/pip install -r science/requirements.txt
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 /tmp/atoms-hf/bin/python science/hf_export.py
# Independent reference (not redistributed with the app):
git clone https://github.com/theochem/AtomDB /tmp/atoms-reference
git -C /tmp/atoms-reference checkout --detach ef573b09a0e96f73857d4d8b263590484777364a
/tmp/atoms-hf/bin/python science/check_hf_profiles.py /tmp/atoms-reference/atomdb/data/density.out.tar.gz
npm run data:matrix && npm run data:check
```

Each record includes spin 2S, charge, configuration, target term, total energy in Ha/eV, energy reference, basis sensitivity, SCF tolerance/cycles, radial grid/count, quadrature, generation command and date. `basisError_hartree` is the **signed difference** from the stated reference; for a finite STO reference it is not a rigorous basis-limit error. The actual tabulated spherical density is sampled with 4πr²ρ. Reject values outside tolerance instead of renormalizing corrupt data. Generation dates and floating-point details may differ across runs/BLAS; reproduce numerical tolerances, not historical timestamps. See [source data](DATA.md) for the separate neutral-record workflow.

## Testing

Run native tests before Vitest to build the parity binary. Add physics unit tests next to the implementation, browser workflows under `tests/browser`, and malformed fixtures by perturbing a copy of valid data. Build before Playwright: its server serves **dist**, not live TypeScript. Check the mobile drawers and WebGL fallback. See [verification](VERIFICATION.md) for toolchain details, including the Chromium substitute used on this runner. Do not commit build output, raw wheels, scratch SCF files or hardware-specific promises.
