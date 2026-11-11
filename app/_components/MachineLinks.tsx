import type { Machine } from "../_lib/technogym";

/** Fichas y videos de una máquina. Se abren en una pestaña nueva. */
export default function MachineLinks({ machine }: { machine: Machine }) {
  return (
    <div className="machine-links">
      {machine.note && <p className="machine-note">{machine.note}</p>}
      {machine.pages.length > 0 && (
        <ul aria-label="Fichas de la máquina">
          {machine.pages.map((page) => (
            <li key={page.url}><a href={page.url} target="_blank" rel="noopener noreferrer"><span>{page.label}</span><i aria-hidden="true">↗</i></a></li>
          ))}
        </ul>
      )}
      <ul aria-label="Videos de la máquina">
        {machine.videos.map((video) => (
          <li key={video.url}>
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
              <span>{video.title}{video.generic && <small> · genérico, no Technogym</small>}</span>
              <i aria-hidden="true">↗</i>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
