/**
 * EA Sports FC squad-rating formula.
 *
 * 1. average = sum(ratings) / n
 * 2. excess  = sum of (rating - average) for every player ABOVE the average
 * 3. rating  = floor((sum + excess) / n)
 *
 * This is the community-verified algorithm: a squad of high+low players rates
 * higher than the plain average because the above-average players contribute a
 * bonus. `n` is the squad size (11 for a full squad); empty slots are passed
 * as 0 so the divisor stays 11.
 */
export function calcSquadRating(ratings: number[]): number {
  const n = ratings.length;
  if (n === 0) return 0;

  const sum = ratings.reduce((a, b) => a + b, 0);
  const average = sum / n;

  let excess = 0;
  for (const r of ratings) {
    if (r > average) excess += r - average;
  }

  return Math.floor((sum + excess) / n);
}
