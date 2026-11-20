# ATOMS v0.5.0 — Atomic visualization workstation

Explore neutral ground-state configurations from hydrogen to oganesson. **Coverage is not uniform accuracy:** hydrogen has an analytic one-electron solution, the first 18 elements have offline Hartree–Fock total densities, and the remaining 100 have qualitative screened-orbital densities. The interactive one-electron ion of a heavy nucleus is **not** that neutral atom.

## Start here

```sh
npm ci
npm run dev
```

Open Vite's local URL. Select a cell, type an exact symbol, name or atomic number, or navigate the focused periodic table with the arrow keys. Start with **O → Full-atom density**: the cloud and radial plot use a converged ROHF total density. Switch the source to **Model Σ** to inspect the estimated contributions of 1s, 2s and 2p. These layers do **not** decompose the HF calculation. In **Single orbital**, choose a real or complex basis to explore a model wavefunction, its nodes and phase. No account, external font server, API, Python or GPU compute service is needed to load the app.

| Question | Where to look |
|---|---|
| What can I trust for this element and observable? | [118-element accuracy matrix](docs/ACCURACY_MATRIX.md) · [scope](docs/SCIENTIFIC_SCOPE.md) |
| How do I read a slice, radial plot or energy? | [User guide](docs/USER_GUIDE.md) · [model equations](docs/MODELS.md) |
| Where do the configurations, terms, weights and radii come from? | [Data provenance and pinned imports](docs/DATA.md) |
| How were the computed densities checked? | [Independent HF profile comparisons](docs/HF_VALIDATION.md) · [verification](docs/VERIFICATION.md) |
| How do I reproduce or extend this? | [Developer guide](docs/DEVELOPER_GUIDE.md) · [renderer benchmarks](docs/BENCHMARK.md) |
| What changed? | [Changelog](CHANGELOG.md) · [audit](docs/AUDIT.md) |

## Engineering

React, TypeScript, Vite and Three.js render seeded worker-generated typed arrays in WebGL2. Without a WebGL2 context, the table, model information, radial plots and energies remain available. The C++ code is a **reference implementation**, not the browser runtime. The original unlicensed GLFW viewer is not included; see [upstream attribution](native/upstream/README.md).

```sh
npm run test:native     # CMake Debug + Release; build before Vitest for parity coverage
npm run typecheck
npm test
npm run data:check      # matrix drift, data, provider and coverage tests
npm run build           # production single-file dist/index.html with inline worker
npx playwright install chromium
npm run test:browser    # exercises production preview
npm run bench           # writes docs/BENCHMARK.md; software rendering by default
```

`vercel.json` retains the static Vite deployment configuration. No deployment is part of this release. Numerical outputs are not laboratory measurements, samples are not trajectories, and implementation validation is not evidence that a model captures correlation or relativistic structure.
