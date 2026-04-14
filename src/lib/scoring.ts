export function calculatePoints(
  predictedHome: number, 
  predictedAway: number, 
  actualHome: number, 
  actualAway: number
): number {
  // 3 pkt – idealny wynik (dokładny score)
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  // 1 pkt – trafiony rezultat (1X2)
  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  const predictedResult = predictedDiff > 0 ? 'HOME' : predictedDiff < 0 ? 'AWAY' : 'DRAW';
  const actualResult = actualDiff > 0 ? 'HOME' : actualDiff < 0 ? 'AWAY' : 'DRAW';

  if (predictedResult === actualResult) {
    return 1;
  }

  // 0 pkt – inaczej
  return 0;
}
