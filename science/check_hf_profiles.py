"""Compare our exported densities to an independently tabulated numerical HF radial profile.

Usage: python science/check_hf_profiles.py /path/to/AtomDB/atomdb/data/density.out.tar.gz
Only diagnostics are published. Raw reference grids are not redistributed.
"""
import hashlib
import json
from pathlib import Path
import sys
import tarfile

import numpy as np

archive = Path(sys.argv[1])
if hashlib.sha256(archive.read_bytes()).hexdigest() != '65b9e56388070276637cab5b69a093e90d44c22d50c2e016676769464096c1ae':
    raise ValueError('Expected density.out.tar.gz from AtomDB ef573b09')
with tarfile.open(archive) as f:
    lines = iter(f.extractfile('density.out').read().decode().splitlines())
profiles = {}
for line in lines:
    parts = line.split()
    if len(parts) != 3 or not all(p.isdigit() for p in parts):
        continue
    z, electrons, n = map(int, parts)
    energies = list(map(float, next(lines).split()))
    data = np.array([list(map(float, next(lines).split())) for _ in range(n)])
    if z == electrons:
        profiles[z] = data
out = ['# HF radial-profile comparisons', '', 'Raw reference: AtomDB `numeric`, commit `ef573b09a0e96f73857d4d8b263590484777364a`. These are model comparisons, **not** measurements or error bars. The numerical reference and ROHF open-shell state/averaging conventions need not coincide. We interpolate reference ρ onto the export grid (linear in r), then report ∫4πr²|Δρ| dr / Z. The DZ comparison substitutes an independent aug-cc-pVDZ SCF calculation for the reference. The density is never rescaled to force agreement.', '', '| Z | Atom | Electron-count residual (e) | Profile difference / Z | DZ–TZ difference / Z | ΔE vs HF reference (Ha) |', '|---:|---|---:|---:|---:|---:|']
files = [json.loads(p.read_text()) for p in Path('src/data/hf').glob('*.json')]
for d in sorted(files, key=lambda d:d['atom']['Z']):
    z = d['atom']['Z']
    raw = profiles[z]
    assert np.all(np.diff(raw[:, 0]) > 0)
    r = np.array(d['density']['rBohr'])
    rho = np.array(d['density']['rhoElectronPerBohr3'])
    other = np.interp(r, raw[:, 0], raw[:, 1], right=0)
    diff = np.trapezoid(4*np.pi*r*r*np.abs(rho-other), r)/z
    if not (diff < 0.05):
        raise ValueError(f'{z}: radial profile differs by >5% in L1 per electron: {diff}')
    out.append(f"| {z} | {d['atom']['symbol']} | {d['density']['integratedElectrons']-z:+.6f} | {diff:.6f} | {d['basisSensitivity']['radialDensityL1Electrons']/z:.6f} | {d['basisError_hartree']:+.6f} |")
Path('docs/HF_VALIDATION.md').write_text('\n'.join(out)+'\n')
