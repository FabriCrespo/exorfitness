const STAGES = [
  { label: "ENTRADA", value: "5 min", note: "suave" },
  { label: "ELÍPTICA", value: "20–30 min", note: "esfuerzo 4–5 de 10" },
  { label: "VUELTA", value: "5 min", note: "muy suave" },
];

export default function CardioProtocol() {
  return (
    <dl className="cardio-protocol" aria-label="Estructura del cardio">
      {STAGES.map((stage) => (
        <div key={stage.label}>
          <dt>{stage.label}</dt>
          <dd><strong>{stage.value}</strong></dd>
          <dd><small>{stage.note}</small></dd>
        </div>
      ))}
    </dl>
  );
}
