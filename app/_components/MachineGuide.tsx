import { type MuscleId } from "../_lib/muscles";
import { type Machine, MACHINES } from "../_lib/technogym";
import MachineLinks from "./MachineLinks";

/** Todas las máquinas Technogym con sus guías; las que trabajan lo elegido van primero. */
export default function MachineGuide({ selected }: { selected: Set<MuscleId> }) {
  const relevance = (machine: Machine) => machine.muscles.filter((muscle) => selected.has(muscle)).length;
  const ordered = [...MACHINES].sort((a, b) => relevance(b) - relevance(a));

  return (
    <section aria-labelledby="machines-title" className="machine-guide">
      <h2 id="machines-title" className="list-title">Máquinas Technogym</h2>
      <p className="machine-intro">Fichas y videos de cada máquina. {selected.size > 0 ? "Arriba las que trabajan lo que elegiste." : "Elige un músculo y subo las que sirven."}</p>
      <ul className="grouped-list machine-list">
        {ordered.map((machine) => (
          <li key={machine.id}>
            <details className={relevance(machine) > 0 ? "is-match" : undefined}>
              <summary>
                <span className="machine-copy"><strong>{machine.name}</strong><small>{machine.line}</small></span>
                <i aria-hidden="true">›</i>
              </summary>
              <MachineLinks machine={machine} />
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
