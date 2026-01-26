// Garden growth and visualization utilities

export interface Plant {
  id: string;
  stage: number; // 0-5
  growthPoints: number;
  plantedAt: string;
}

export interface Garden {
  plants: Plant[];
  animals: string[];
  gardenLevel: number;
}

// Plant stage information
export const PLANT_STAGES = [
  {
    stage: 0,
    name: 'Seed',
    emoji: '🌰',
    minPoints: 0,
    maxPoints: 19,
    description: 'Just planted!',
  },
  {
    stage: 1,
    name: 'Sprout',
    emoji: '🌱',
    minPoints: 20,
    maxPoints: 49,
    description: 'Starting to grow',
  },
  {
    stage: 2,
    name: 'Sapling',
    emoji: '🌿',
    minPoints: 50,
    maxPoints: 99,
    description: 'Growing strong',
  },
  {
    stage: 3,
    name: 'Young Tree',
    emoji: '🌳',
    minPoints: 100,
    maxPoints: 199,
    description: 'Flourishing!',
  },
  {
    stage: 4,
    name: 'Mature Tree',
    emoji: '🌲',
    minPoints: 200,
    maxPoints: 399,
    description: 'Majestic tree',
  },
  {
    stage: 5,
    name: 'Ancient Tree',
    emoji: '🎋',
    minPoints: 400,
    maxPoints: Infinity,
    description: 'Legendary!',
  },
];

// Garden level information
export const GARDEN_LEVELS = [
  {
    level: 0,
    name: 'Empty Plot',
    emoji: '🟫',
    description: 'Start scanning to plant seeds!',
    background: '#8B7355',
  },
  {
    level: 1,
    name: 'Seedlings',
    emoji: '🌱',
    description: 'Your garden is sprouting',
    background: '#D4A574',
  },
  {
    level: 2,
    name: 'Garden',
    emoji: '🏡',
    description: 'A beautiful garden',
    background: '#90EE90',
  },
  {
    level: 3,
    name: 'Forest',
    emoji: '🌲',
    description: 'Growing into a forest',
    background: '#228B22',
  },
  {
    level: 4,
    name: 'Ecosystem',
    emoji: '🌍',
    description: 'A thriving ecosystem!',
    background: '#006400',
  },
];

// Animal unlock thresholds
export const ANIMAL_UNLOCKS = [
  { threshold: 5, animal: '🦋', name: 'Butterfly' },
  { threshold: 10, animal: '🐦', name: 'Bird' },
  { threshold: 20, animal: '🐰', name: 'Rabbit' },
  { threshold: 30, animal: '🐿️', name: 'Squirrel' },
  { threshold: 50, animal: '🦌', name: 'Deer' },
  { threshold: 75, animal: '🦊', name: 'Fox' },
  { threshold: 100, animal: '🐻', name: 'Bear' },
];

// Get plant stage info
export function getPlantStageInfo(growthPoints: number) {
  return PLANT_STAGES.find(
    (s) => growthPoints >= s.minPoints && growthPoints <= s.maxPoints
  ) || PLANT_STAGES[0];
}

// Get garden level info
export function getGardenLevelInfo(level: number) {
  return GARDEN_LEVELS[level] || GARDEN_LEVELS[0];
}

// Get next animal to unlock
export function getNextAnimal(plantCount: number) {
  return ANIMAL_UNLOCKS.find((a) => plantCount < a.threshold);
}

// Get progress to next animal
export function getAnimalProgress(plantCount: number) {
  const nextAnimal = getNextAnimal(plantCount);
  if (!nextAnimal) return { progress: 100, remaining: 0, nextAnimal: null };

  const prevThreshold = ANIMAL_UNLOCKS
    .filter((a) => a.threshold <= plantCount)
    .pop()?.threshold || 0;

  const progress = ((plantCount - prevThreshold) / (nextAnimal.threshold - prevThreshold)) * 100;
  const remaining = nextAnimal.threshold - plantCount;

  return { progress, remaining, nextAnimal };
}

// Get growth points for carbon rating
export function getGrowthPointsForRating(carbonRating: string): number {
  const growthMap: Record<string, number> = {
    A: 20,
    B: 15,
    C: 10,
    D: 7,
    E: 5,
    F: 3,
  };
  return growthMap[carbonRating?.toUpperCase()] || 10;
}

// Get all unlocked animals
export function getUnlockedAnimals(plantCount: number): string[] {
  return ANIMAL_UNLOCKS.filter((a) => plantCount >= a.threshold).map((a) => a.animal);
}

// Calculate total garden growth points
export function getTotalGrowthPoints(plants: Plant[]): number {
  return plants.reduce((sum, plant) => sum + plant.growthPoints, 0);
}

// Get garden statistics
export function getGardenStats(garden: Garden) {
  const totalGrowth = getTotalGrowthPoints(garden.plants);
  const averageGrowth = garden.plants.length > 0 ? totalGrowth / garden.plants.length : 0;

  const stageDistribution = garden.plants.reduce((acc, plant) => {
    acc[plant.stage] = (acc[plant.stage] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalPlants: garden.plants.length,
    totalGrowth,
    averageGrowth,
    stageDistribution,
    gardenLevel: garden.gardenLevel,
    animalsUnlocked: garden.animals.length,
  };
}
