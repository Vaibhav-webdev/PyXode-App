import { TopicContent, TabDef, TabKey } from "./types";
import { BASIC_TOPICS } from "./basic";
import { AIML_TOPICS } from "./aiml";
import { DATA_SCIENCE_TOPICS } from "./dataScience";
import { WEB_DEV_TOPICS } from "./webDev";
import { APP_DEV_TOPICS } from "./appDev";
import { DSA_TOPICS } from "./dsa";
import { AUTOMATIONSCRIPTING_TOPICS } from "./automationScripting";

export const TABS: TabDef[] = [
  { key: "basic", label: "Basic" },
  { key: "dsa", label: "DSA In Python"},
  { key: "automationScripting", label: "Automation Scripting"},
  { key: "machineLearning", label: "Machine Learning" },
  { key: "dataScience", label: "Data Science" },
  { key: "webDev", label: "Web Development" },
];

export const TOPICS_BY_TAB: Record<TabKey, TopicContent[]> = {
  basic: BASIC_TOPICS,
  machineLearning: AIML_TOPICS,
  automationScripting: AUTOMATIONSCRIPTING_TOPICS,
  dsa: DSA_TOPICS,
  dataScience: DATA_SCIENCE_TOPICS,
  webDev: WEB_DEV_TOPICS,
};

export const ALL_TOPICS: TopicContent[] = Object.values(TOPICS_BY_TAB).flat();

export const getTopicById = (id: string): TopicContent | undefined =>
  ALL_TOPICS.find((t) => t.id === id);

export * from "./types";