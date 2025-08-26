/**
 * Calculate the plasma shape
 * @param R - The major radius
 * @param Z - The vertical position
 * @param a - The small radius
 * @param elon_up - The elongation of the upper part
 * @param elon_dn - The elongation of the lower part
 * @param tr_up - The triangularity of the upper part
 * @param tr_dn - The triangularity of the lower part
 * @param x_up - The x-point severity of the upper part
 * @param x_dn - The x-point severity of the lower part
 * @returns A tuple containing two arrays: the R coordinates and the Z coordinates of the plasma shape
 */
export function calculatePlasmaShape(
  R: number,
  Z: number,
  a: number,
  elon_up: number,
  elon_dn: number,
  tr_up: number,
  tr_dn: number,
  x_up: number,
  x_dn: number
): [number[], number[]] {
  const ntet = 200;
  const tet = linspace(0, 2 * Math.PI, ntet + 1);
  const sint = tet.map((t) => Math.sin(t));
  const cost = tet.map((t) => Math.cos(t));

  const tr = 0.5 * (tr_up + tr_dn);
  const dtr = 0.5 * (tr_up - tr_dn);
  const vit = 0.5 * (elon_up + elon_dn);
  const dvit = 0.5 * (elon_up - elon_dn);

  let fac1 = new Array(ntet + 1).fill(1);
  if (x_up > 0) {
    fac1 = cost.map((c) => x_up * Math.abs(c) - (x_up - 1.0) * c * c);
  }

  let fac2 = new Array(ntet + 1).fill(1);
  if (x_dn > 0) {
    fac2 = cost.map((c) => x_dn * Math.abs(c) - (x_dn - 1.0) * c * c);
  }

  const sepfac = [...fac2];
  for (let i = 0; i < sint.length; i++) {
    if (sint[i]! >= 0) {
      sepfac[i] = fac1[i];
    }
  }

  const uksr = sepfac.map(
    (sf, i) => a * (sf * cost[i]! - (tr + dtr * sint[i]!) * sint[i]! * sint[i]!)
  );

  const vksr = sint.map((s, i) => a * s * (vit + dvit * s));

  const r = uksr.map((u, i) => R + u);
  const z = vksr.map((v, i) => Z + v);

  return [r, z];
}

// Helper function to create linearly spaced array (equivalent to numpy.linspace)
function linspace(start: number, end: number, num: number): number[] {
  const result: number[] = [];
  const step = (end - start) / (num - 1);

  for (let i = 0; i < num; i++) {
    result.push(start + i * step);
  }

  return result;
}
