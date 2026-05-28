import { QR_RECTS } from "@/lib/brand";

/** LINE公式アカウントURLを内蔵した25×25のQRコード（外部依存なし）。 */
export function QrCode({ size = 132 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4 33 33"
      shapeRendering="crispEdges"
      style={{ borderRadius: 8, boxShadow: "0 1px 6px rgba(0,0,0,.12)" }}
    >
      <rect x="-4" y="-4" width="33" height="33" fill="#fff" />
      {QR_RECTS.map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={1} fill="#000" />
      ))}
    </svg>
  );
}
