"""Extract neutral atomic records from a pinned wheel without executing package code."""
import ast
import hashlib
import json
import re
import sqlite3
import sys
import zipfile
from pathlib import Path

wheel = Path(sys.argv[1])
if hashlib.sha256(wheel.read_bytes()).hexdigest() != '76f415767b654634e51dead755513ef431abf200e892eab8468aa659ff218d1c':
    raise ValueError('Expected the mendeleev 1.3.0 PyPI wheel')
db = sqlite3.connect(':memory:')
with zipfile.ZipFile(wheel) as z:
    db.deserialize(z.read('mendeleev/elements.db'))
mass_wheel = Path(sys.argv[2])
if hashlib.sha256(mass_wheel.read_bytes()).hexdigest() != 'e9155d2bf5ac10050abeff2f99096d4f04312c0c8a6bb432e28744367c5064b3':
    raise ValueError('Expected periodictable 2.1.0 wheel')
with zipfile.ZipFile(mass_wheel) as z:
    module = ast.parse(z.read('periodictable/mass.py').decode())
    tables = {x.targets[0].id: x.value.value for x in module.body if isinstance(x, ast.Assign) and isinstance(x.value, ast.Constant)}
weights = {line.split()[1]: line.split()[3] for line in tables['element_mass'].splitlines()}
mass_numbers = {line.split('-')[1]: int(line.rsplit(',',1)[1][1:-1]) for line in tables['isotope_mass'].splitlines() if line.endswith(']')}
rows = []
cores = {}
for Z, symbol, name, group, period, block, fallback, radius, shells, level, energy, uncertainty, semi, theory, refs in db.execute('''
    SELECT e.atomic_number,symbol,name,group_id,period,block,electronic_configuration,covalent_radius_cordero,ground_shells,
           ground_level,ionization_energy,uncertainty,is_semi_empirical,is_theoretical,i."references"
    FROM elements e LEFT JOIN ionizationenergies i ON i.atomic_number=e.atomic_number AND ion_charge=0
    ORDER BY e.atomic_number'''):
    config = shells or fallback
    occupied = {}
    for part in re.split(r'[. ]+', config):
        if part.startswith('['):
            occupied.update(cores[part[1:-1]])
        else:
            n, l, k = re.fullmatch(r'(\d+)([spdf])(\d*)', part).groups()
            key = n+l
            count = int(k or 1)
            assert key not in occupied and int(n) > 'spdf'.index(l) and 0 < count <= 4*'spdf'.index(l)+2
            occupied[key] = count
    assert sum(occupied.values()) == Z == len(rows)+1
    cores[symbol] = occupied
    weight = weights.get(symbol, "-")
    mass = mass_numbers[symbol] if weight == "-" else float(weight.split("(")[0])
    name = {'Aluminum':'Aluminium', 'Cesium':'Caesium'}.get(name, name)
    if block not in ('s','p','d','f'):
        raise ValueError(f'Invalid block for {symbol}')
    rows.append(dict(name=name, group=group, period=period, block=block, weight=weight, mass=mass, Z=Z, symbol=symbol, occupied=occupied, level=level, ie=energy, uncertainty=uncertainty,
                     ieKind='unavailable' if energy is None else 'theoretical' if theory else 'semi-empirical' if semi else 'evaluated', references=refs, radius=radius))
assert len(rows) == 118
Path('src/data/neutral.json').write_text('[\n'+',\n'.join(json.dumps(row) for row in rows)+'\n]\n')
