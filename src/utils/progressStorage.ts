import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "@python_app_progress_v1";

export type TopicProgress = {
  progress: number; // 0 to 1
  completed: boolean;
  bestScore: number; // 0 to 100
};

type ProgressMap = Record<string, TopicProgress>;

async function readMap(): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getAllProgress(): Promise<ProgressMap> {
  return readMap();
}

export async function getTopicProgress(topicId: string): Promise<TopicProgress> {
  const all = await readMap();
  return all[topicId] ?? { progress: 0, completed: false, bestScore: 0 };
}

// Called when the learner finishes a quiz — persists completion + best score.
export async function saveTopicResult(
  topicId: string,
  scorePercent: number
): Promise<void> {
  try {
    const all = await readMap();
    const prev = all[topicId] ?? { progress: 0, completed: false, bestScore: 0 };
    all[topicId] = {
      progress: 1,
      completed: true,
      bestScore: Math.max(prev.bestScore, scorePercent),
    };
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    // ignore persistence failures — UI already reflects the result
  }
}

// First topic in a tab is always unlocked; every next topic unlocks once
// the previous one in that same tab has been completed at least once.
export async function isTopicUnlocked(
  tabTopicIds: string[],
  topicId: string
): Promise<boolean> {
  const index = tabTopicIds.indexOf(topicId);
  if (index <= 0) return true;
  const all = await readMap();
  const prevTopicId = tabTopicIds[index - 1];
  return !!all[prevTopicId]?.completed;
}