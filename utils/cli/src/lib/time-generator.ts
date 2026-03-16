export interface TimeGeneratorConfig {
  controlCount: number;
  averageLegTimeMs: number; // Base time per leg (e.g., 5 minutes = 300000ms)
  variationPercent: number; // Runner skill variation (e.g., 30%)
  legLengthVariation: number; // Control-to-control distance variation (e.g., 20%)
}

export class TimeGenerator {
  private runnerSkillFactors: Map<string, number> = new Map();

  constructor(private config: TimeGeneratorConfig) {}

  // Generate consistent skill factor for each runner (0.7 to 1.3 for 30% variation)
  private getRunnerSkillFactor(runnerId: string): number {
    if (!this.runnerSkillFactors.has(runnerId)) {
      const variation = this.config.variationPercent / 100;
      const factor = 1 + (Math.random() * 2 - 1) * variation;
      this.runnerSkillFactors.set(runnerId, factor);
    }
    return this.runnerSkillFactors.get(runnerId)!;
  }

  // Generate time for specific leg (runner + control)
  private generateLegTime(runnerId: string, controlIndex: number): number {
    const baseTime = this.config.averageLegTimeMs;
    const runnerFactor = this.getRunnerSkillFactor(runnerId);

    // Add random leg-specific variation (some legs are longer/shorter)
    const legVariation = this.config.legLengthVariation / 100;
    const legFactor = 1 + (Math.random() * 2 - 1) * legVariation;

    // Add small random noise (±5%) for realism
    const noise = 1 + (Math.random() * 0.1 - 0.05);

    return Math.round(baseTime * runnerFactor * legFactor * noise);
  }

  // Calculate cumulative split time
  generateSplitTime(runnerId: string, controlIndex: number): number {
    let totalTime = 0;
    for (let i = 0; i <= controlIndex; i++) {
      totalTime += this.generateLegTime(runnerId, i);
    }
    return totalTime;
  }
}

// Realistic defaults for orienteering
export const DEFAULT_TIME_CONFIG: TimeGeneratorConfig = {
  controlCount: 3,
  averageLegTimeMs: 300000, // 5 minutes per leg
  variationPercent: 30, // ±30% skill difference
  legLengthVariation: 20, // ±20% distance variation
};
