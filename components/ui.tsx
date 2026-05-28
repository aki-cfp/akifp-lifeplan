import type { ReactNode } from "react";
import { NAVY } from "@/lib/brand";

/** 数値入力フィールド（ラベル＋単位サフィックス）。 */
export function Field({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span style={{ color: NAVY }} className="font-medium">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full rounded border px-2 py-1.5 text-right"
          style={{ borderColor: "#cbd5e1" }}
        />
        {suffix && <span className="text-xs text-slate-500 shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

/** 折りたたみ式セクション（<details>）。 */
export function Section({
  title,
  children,
  open,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="rounded-lg border bg-white overflow-hidden"
      style={{ borderColor: "#e2e8f0" }}
    >
      <summary
        className="cursor-pointer select-none px-4 py-3 font-bold text-white"
        style={{ background: NAVY }}
      >
        {title}
      </summary>
      <div className="p-4 grid gap-3">{children}</div>
    </details>
  );
}
