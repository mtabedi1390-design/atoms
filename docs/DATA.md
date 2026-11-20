# Atomic data: provenance and reproduction

`src/data/neutral.json` is a normalized snapshot, not a live query. On 2026-11-20 two versioned PyPI wheels were retrieved; `science/import_neutral.py` checks their SHA-256 values **before reading** the SQLite database and Python literal tables. The importer uses only the Python 3.11 standard library and executes neither package. Upstream datasets need not be redistributed in full.

```sh
mkdir -p /tmp/atoms-data
python3 -m pip download --no-deps --only-binary=:all: -d /tmp/atoms-data mendeleev==1.3.0 periodictable==2.1.0
python3 science/import_neutral.py /tmp/atoms-data/mendeleev-1.3.0-py3-none-any.whl /tmp/atoms-data/periodictable-2.1.0-py3-none-any.whl
npm run data:matrix
npm run data:check
git diff --exit-code -- src/data/neutral.json docs/ACCURACY_MATRIX.md
```

| Snapshot | SHA-256 |
|---|---|
| [mendeleev 1.3.0](https://pypi.org/project/mendeleev/1.3.0/#files) | `76f415767b654634e51dead755513ef431abf200e892eab8468aa659ff218d1c` |
| [periodictable 2.1.0](https://pypi.org/project/periodictable/2.1.0/#files) | `e9155d2bf5ac10050abeff2f99096d4f04312c0c8a6bb432e28744367c5064b3` |
| normalized JSON | `46bf2a83c901b406f8f74c67357f25ca9178ce881840cb6fb14e920db068a00a` |

These are pinned **secondary distributions** of evaluated facts, not newly downloaded primary NIST or CIAAW tables. Upstream versions may differ from the latest primary evaluation. See `docs/licenses/` for the mendeleev MIT notice. The periodictable mass module is marked public domain. Attribution does not grant blanket permission to redistribute third-party publications.

| Fields | Source, interpretation and limitations |
|---|---|
| Z, symbol, name, period, group, block | mendeleev `elements` table; use Aluminium and Caesium spellings. The adopted group-3 layout places La/Ac in group 3; the rest of the detached series have null group. Position/block is a layout convention, not necessarily the differentiating electron. Category is the inherited ATOMS qualitative taxonomy, not a measured property. |
| Neutral occupied shells | Z=1–108: mendeleev `ionizationenergies.ground_shells` for charge 0, from [NIST ASD](https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html). Expand any source core (including Cd and Hg), validate quantum numbers, capacity, uniqueness and count **before** emitting occupations. Display shorthand relative to the preceding noble gas. Z=109–118 use `elements.electronic_configuration`. |
| Evidence for configurations | Adopted/evaluated through Lr, not a claim of direct spectroscopic confirmation for every orbital. For Lr the adopted valence orbital is 7p. Conservatively flag all Z≥104 as predicted. Ds/Rg predictions now use 6d⁹7s¹ / 6d¹⁰7s¹; this is a source choice, not an experimental correction. |
| Ground level, including J | Preserve `ground_level` for the same neutral row; no inference from Hund's rules. `*` means odd parity; `2P*<1/2>` includes J=½. Some heavy entries contain only J. Z=109–118: null. A reference term does not make a model density term-resolved. |
| First ionization energy | Neutral `ionization_energy`, in eV, with `uncertainty`, reference identifiers and separate theoretical/semi-empirical flags. H is a high-precision theoretical entry; Rf and Db are also theoretical. Null beyond Hs. This is **not** the plotted orbital eigenvalue, HF total energy or a Slater energy. |
| Atomic weight / A | `periodictable.mass.element_mass`, based on [CIAAW 2021](https://doi.org/10.1515/pac-2019-0603). 84 standard weights; display a dimensionless abridged/representative value, preserving source uncertainty notation in `weight`. An interval is not an exact constant for every sample. For the other 34 use the source's bracketed nominal **mass number**, not a mass in u, a precise isotope mass, or a claim about the latest longest half-life. |
| Covalent radius | `elements.covalent_radius_cordero` in pm (96 entries). [Cordero et al.](https://doi.org/10.1039/B801115J); the secondary table averages alternatives for C, Mn, Fe and Co. Not a vdW radius, mean electron radius or display boundary. No radius beyond Cm. |

Scientific comparisons with the baseline: 118 configurations checked; 2 changed. 102 IE values, 14 radius values and 58 mass values changed (often precision or convention). Across these four fields 110 distinct records differ. All 118 gained pinned provenance. A value that remains identical is not counted as a correction.

HF JSON files are independently **computed** artifacts, not part of the element-data import. Their basis sets, SCF convergence, reference energies, angular averaging and radial integration are documented in [models](MODELS.md) and [validation](HF_VALIDATION.md).
