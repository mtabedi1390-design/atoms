# v0.5.0 verification — 2026-11-20 UTC

Repository `mtabedi1390-design/atoms`; clean starting SHA `5c93dae70af04e0c08c298e544f00095ccdc8560` on the user-authorized `arena/0766f865-atoms` branch. `git fetch origin main` and `git diff --stat origin/main` established the baseline. No branch switch, merge, deployment or main-branch write was used.

## Baseline before source edits

| Command | Actual outcome |
|---|---|
| `npm ci --registry=https://registry.npmjs.org` | Installed from lockfile |
| `npm run typecheck` | Passed |
| `npm test` | 61 passed; 4 native parity tests skipped (reference executable not built) |
| `npm run test:native` | Exit 127: `cmake: command not found` |
| `npm run build` | Passed, single HTML 918.93 kB / gzip 258.45 kB |
| `npm run test:browser` | 12 launch failures: headless Chromium executable missing; **not** 12 application assertions |

Installed CMake 3.31.10 in the user environment. The browser CDN is outside the runner's package network. Used Chromium 131.0.6778.0 from npm `@sparticuz/chromium@131.0.1` and its bundled Linux NSS libraries, via a temporary Playwright executable wrapper. No compiler, browser binary or cache is committed. Node v22.22.3, npm 10.9.8, Python 3.11.2, g++ 12.2.0, x86-64 Linux. Clean installations with normal Playwright access should use `npx playwright install chromium` rather than this environment-specific substitute.

## Final checks

| Command | Outcome |
|---|---|
| `npm run test:native` | CTest Debug 1/1, Release 1/1. Direct runs of both `quantum_core_test` executables: `checks=340 failures=0` each |
| `npm run typecheck` | Passed, no TypeScript errors |
| `npm test` | **71/71 passed**, 6 files, no skipped tests; used `build-core-Release/quantum_reference_dump` |
| `npm run data:matrix && npm run data:check` | Regenerated human/machine matrices; drift check and 23/23 data/provider/coverage tests passed (subset of 71) |
| `npm run build` | Passed: single `dist/index.html`, **1,476.20 kB**, gzip **540.35 kB** |
| `npm run test:browser` | **14/14 passed** on Chromium/SwiftShader; separate all-118 selection sweep uses the analytical fallback |
| `npm run bench` | Seven measured workloads. [Renderer and timings](BENCHMARK.md). No physical GPU benchmark |

Intermediate failures mattered: re-indexing layout tuples incorrectly assigned Fe to the p block; the metadata test caught it and layout now uses source fields. The first browser rerun's five console-error failures revealed a remote font request; removed it rather than suppressing console errors. The 118-cell test initially matched multiple headers; scoped it to the telemetry bar and reran. Real-browser tests cover elements/search/keyboard, rapid switching, basis/phase changes, clipping, model vs HF panels, opacity/visibility, current, mobile and WebGL failure. This does not certify all browsers or hardware.

## Scientific reproduction and interpretation

- `python3 science/import_neutral.py /tmp/mendeleev-1.3.0-py3-none-any.whl /tmp/periodictable-2.1.0-py3-none-any.whl`: 118 rows, known hashes, neutral counts/capacities verified. All 118 displayed shorthands independently re-expanded in Vitest. [Field provenance and differences](DATA.md).
- `OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 /tmp/hfenv/bin/python science/hf_export.py`: regenerated all 18 H–Ar exports. Both production TZ and comparison DZ SCFs converged for each. [Pinned packages](../science/requirements.txt). Max exported grid electron-count residual **0.000480 e** (Ar); acceptance 0.002 e. The largest total-energy difference from the stated HF reference is **0.01383 Ha** (Ne), not an error relative to exact correlated theory.
- `/tmp/hfenv/bin/python science/check_hf_profiles.py /tmp/atoms-ref/atomdb/data/density.out.tar.gz`: 18 independent radial-profile comparisons; max integrated absolute profile difference per electron **0.013762** (N). Test threshold 0.05. See [per-atom values and comparison conventions](HF_VALIDATION.md). Relative differences are **not** experimental uncertainties.
- Analytic unit and sampler tests cover radial normalization and nodes, angular orthogonality and negative m, stationary current vs numerical gradients, deterministic seeds, radial/angular KS checks, tabulated-density rejection and finite-domain integration. Numerical integration of the screened neutral mixture is checked within 0.005 e for each of the 118 configurations. Charge conservation alone does not establish a physically accurate density.
- **Remaining scientific limits:** 100 neutral elements have only the qualitative full-density model. The 17 multi-electron HF additions/benchmarks beyond H do not provide signed orbital functions. No correlated, relativistic or finite-nucleus radial data were validated. The independent profiles are non-relativistic HF comparisons. Superheavy configurations remain predictions; 10 term/IE records are absent. Physical GPU timings, GPU-completion timestamps and process-resident memory were not measured.
