export default function EquipmentMark({ equipment }: { equipment: string }) {
  const kind = /polea|máquina/i.test(equipment) ? "machine" : /barra|banco/i.test(equipment) ? "bar" : "dumbbell";

  return (
    <span className={`equipment-mark equipment-${kind}`} aria-hidden="true">
      {kind === "machine" ? (
        <svg viewBox="0 0 42 32"><path d="M8 27V5h5v22M8 10h22M30 7v20M13 13h13v9H13zM18 16h4" /></svg>
      ) : kind === "bar" ? (
        <svg viewBox="0 0 42 32"><path d="M8 8v16M4 11v10M34 8v16M38 11v10M8 16h26" /></svg>
      ) : (
        <svg viewBox="0 0 42 32"><path d="M8 9v14M4 12v8M34 9v14M38 12v8M8 16h26" /></svg>
      )}
    </span>
  );
}
