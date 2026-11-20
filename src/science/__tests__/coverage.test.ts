import { describe, expect, it } from 'vitest';
import { ELEMENTS, elementByZ } from '@/data/elements';
import { coverage } from '../coverage';
import { hfDatasetFor, selectProvider, validateHFDataset } from '../providers';
import { initialState, reducer } from '@/state/appState';
import { integrateElectronCount } from '@/physics/density';
import { slaterZeff } from '@/physics/models';

describe('neutral coverage', () => {
  it('resolves an honest preferred density and total energy for each Z', () => {
    for(const e of ELEMENTS) {
      const c = coverage(e);
      for(const [observable,id] of [['electron-density',c.totalDensity],['total-energy',c.totalEnergy]] as const) {
        const s = selectProvider({Z:e.Z,observable,accuracy:'quantitative'});
        expect(s.result?.providerId ?? null).toBe(id);
      }
      expect(c.heavyRelativistic).toBeNull();
    }
  });
  it('expands every display shorthand back to exactly its occupied orbitals', () => {
    for (const e of ELEMENTS) {
      const expanded = new Map<string,number>();
      for (const token of e.configuration.value.split(' ')) {
        if (token.startsWith('[')) {
          const core=ELEMENTS.find(c=>`[${c.symbol}]`===token)!;
          expect(core.Z).toBeLessThan(e.Z);
          for (const s of core.subshells) expanded.set(s.label,s.occupancy);
        } else {
          const [,label,k]=/^(\d[spdf])(\d+)$/.exec(token)!;
          expect(expanded.has(label)).toBe(false);
          expanded.set(label,Number(k));
        }
      }
      expect(expanded).toEqual(new Map(e.subshells.map(s=>[s.label,s.occupancy])));
      for(const s of e.subshells) expect(s.n > s.l && Number.isInteger(s.occupancy) && s.occupancy>0).toBe(true);
    }
  });
  it('preserves evidence flags and source-specific heavy predictions',()=>{
    expect(elementByZ(101).ionizationEnergy_eV.evidence).toBe('semi-empirical');
    expect(elementByZ(104).ionizationEnergy_eV.evidence).toBe('theoretical');
    expect(elementByZ(109).groundLevel).toBeNull();
    expect(elementByZ(110).configuration.value).toContain('6d9 7s1');
    expect(elementByZ(111).configuration.value).toContain('6d10 7s1');
  });
  it('integrates the independent-electron density for all neutral configurations',()=>{
    for(const e of ELEMENTS) {
      const count=e.subshells.reduce((v,s)=>v+integrateElectronCount(s.n,s.l,s.occupancy,slaterZeff(e,s).zeff,undefined,800),0);
      expect(Math.abs(count-e.Z),e.symbol).toBeLessThan(0.005);
    }
  });
  it('rejects a rescaled positive HF grid even when the stored count claims neutrality',()=>{
    const d=hfDatasetFor(18)!;
    expect(()=>validateHFDataset({...d,density:{...d.density,rhoElectronPerBohr3:d.density.rhoElectronPerBohr3.map(v=>2*v)}})).toThrow();
    expect(()=>validateHFDataset({...d,scf:{...d.scf,converged:false}})).toThrow();
  });
  it('cannot carry an ion Hamiltonian or phase colouring into neutral density mode',()=>{
    let s=reducer(initialState(),{type:'selectElement',Z:8});
    s=reducer(s,{type:'set',patch:{model:'hydrogenic-exact'}});
    s=reducer(s,{type:'render',patch:{colorMode:'phase-real'}});
    s=reducer(s,{type:'set',patch:{mode:'atom'}});
    expect(s.model).toBe('slater-screened-hydrogenic');
    expect(s.render.colorMode).toBe('density');
    expect(s.densitySource).toBe('hf');
    expect(reducer(s,{type:'selectElement',Z:118}).densitySource).toBe('model');
  });
});
