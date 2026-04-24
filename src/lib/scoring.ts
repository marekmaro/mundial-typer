export function calculatePoints(hP: number, aP: number, hR: number, aR: number, isJoker: boolean = false): number {
  let pts = 0;
  if (hP === hR && aP === aR) {
    pts = 3; // Idealny wynik
  } else if ((hP > aP && hR > aR) || (hP < aP && hR < aR) || (hP === aP && hR === aR)) {
    pts = 1; // Trafiony zwycięzca / remis
  }
  
  return isJoker ? pts * 2 : pts;
}
