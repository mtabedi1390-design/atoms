# Renderer benchmark

Generated: 2026-11-20T17:08:38.477Z

**Rendering mode: SwiftShader / ANGLE — CPU software rasterisation (CI container, no GPU)**

- WebGL renderer: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`
- OS: linux 6.1.158+ x64
- Browser: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.6778.0 Safari/537.36
- Viewport: 1440×900, devicePixelRatio 1, point sprites additive blended
- Protocol: `?z&samples&mode&adaptive=0`; 4 s warm-up, six telemetry FPS samples 700 ms apart; median reported. CDF setup is part of worker time. Delivery includes main-thread scheduling. Staging times CPU buffer preparation, not asynchronous GPU completion. GPU timings and resident memory were not measured.
- Hardware acceleration: NOT USED — these FPS values say nothing about real GPU performance

| mode | Z | requested samples | rendered points | median FPS | min–max | worker total (ms) | CDF setup (ms) | delivery (ms) | staging (ms) | draws |
|---|---|---|---|---|---|---|---|---|---|---|
| single | 1 | 25,000 | 25,000 | 20 | 18–21 | 55 | 11.2 | 0.4 | 2.7 | 6 |
| single | 1 | 75,000 | 75,000 | 8 | 7–10 | 116 | 14.5 | 0.5 | 2.8 | 6 |
| single | 1 | 150,000 | 150,000 | 5 | 3–6 | 163 | 14.2 | 0.4 | 3.2 | 6 |
| single | 1 | 300,000 | 300,000 | 2 | 1–3 | 274 | 12.4 | 0.4 | 5.6 | 6 |
| atom | 10 | 75,000 | 75,000 | 8 | 1–35 | 51 | 2.0 | 1.8 | 2.7 | 6 |
| atom | 10 | 150,000 | 150,000 | 4 | 4–4 | 98 | 2.1 | 0.2 | 3.7 | 6 |
| atom | 10 | 300,000 | 300,000 | 2 | 2–2 | 159 | 2.2 | 0.4 | 8.6 | 6 |

## Interpretation

- Software rasterisation is bandwidth- and CPU-bound; the low FPS here is caused by SwiftShader, not by the sample count alone. Under the historical CI screenshots the same caveat applied.
- Full-atom mode renders one cloud for HF total density, or one cloud per subshell for model densities (no per-particle meshes) and uses a shared brightness normalisation; the two modes are not directly comparable in fill-rate cost.
- On capable hardware the target is 60 FPS; the app's adaptive quality reduces the requested sample count after 3 s below 30 FPS. That adaptation is disabled here so workloads stay fixed.
- Run `ATOMS_BENCH_GPU=hardware npm run bench` on a workstation to produce hardware numbers, and record the renderer string. No hardware benchmark was executed in this environment.
