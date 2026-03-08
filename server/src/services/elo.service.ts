import {
  ELO_K_FACTOR_DEFAULT,
  ELO_K_FACTOR_HIGH,
  ELO_HIGH_RATING_THRESHOLD,
} from "../config/constants";

export class EloService {
  /**
   * Calculate expected score for player A against player B
   * E_A = 1 / (1 + 10^((R_B - R_A) / 400))
   */
  static expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Get K-factor based on player rating
   * Higher rated players have lower K-factor (less volatile)
   */
  static getKFactor(rating: number): number {
    return rating >= ELO_HIGH_RATING_THRESHOLD
      ? ELO_K_FACTOR_HIGH
      : ELO_K_FACTOR_DEFAULT;
  }

  /**
   * Calculate new ratings after a match
   * @param ratingA - Player A's current rating
   * @param ratingB - Player B's current rating
   * @param scoreA - 1 for win, 0.5 for draw, 0 for loss
   * @returns { newRatingA, newRatingB, deltaA, deltaB }
   */
  static calculateNewRatings(
    ratingA: number,
    ratingB: number,
    scoreA: number
  ): {
    newRatingA: number;
    newRatingB: number;
    deltaA: number;
    deltaB: number;
  } {
    const scoreB = 1 - scoreA;

    const expectedA = this.expectedScore(ratingA, ratingB);
    const expectedB = this.expectedScore(ratingB, ratingA);

    const kA = this.getKFactor(ratingA);
    const kB = this.getKFactor(ratingB);

    const deltaA = Math.round(kA * (scoreA - expectedA));
    const deltaB = Math.round(kB * (scoreB - expectedB));

    const newRatingA = Math.max(0, ratingA + deltaA);
    const newRatingB = Math.max(0, ratingB + deltaB);

    return { newRatingA, newRatingB, deltaA, deltaB };
  }
}
