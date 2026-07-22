// ---------------------------------------------------------------------------
// Shared types used across all topic data files
// ---------------------------------------------------------------------------

export type TabKey = "basic" | "machineLearning" | "dataScience" | "webDev" | "appDev" | "dsa" | "automationScripting";

export type TabDef = {
  key: TabKey;
  label: string;
};

export type IconKey =
  | "python"
  | "controlFlow"
  | "terminal"
  | "code2"
  | "list"
  | "box"
  | "braces"
  | "alertTriangle"
  | "sparkles"
  | "layers"
  | "python" 
  | "controlFlow" 
  | "terminal" 
  | "code2" 
  | "list" | "box" | "monitor" | "globe" | "sheet" | "mail" | "bot"
   | "code-xml" | "flame" | "briefcase" | "rocket" | "network" | "key-round" | "server"
  | "braces" | "alertTriangle" | "sparkles" | "layers" | "wrench"
  | "code" | "repeat" | "calculator" | "keyboard" | "git-branch"
  | "infinity" | "grid-3x3" | "type" | "lock" | "circle-dot"
  | "book-open" | "square-function" | "sliders-horizontal" | "git-merge"
  | "file-text" | "file-json" | "file-binary" | "alert-triangle"
  | "badge-alert" | "package" | "library" | "file-code" | "boxes"
  | "hammer" | "shapes" | "shield" | "eye-off" | "wand-2"
  | "settings" | "gift" | "folder-tree" | "list-tree" | "git-compare"
  | "move-right" | "database" | "trash-2";

// A single "predict the output" / MCQ / code-writing style question.
// No real code execution engine anywhere — for "code_writing" questions the
// user's typed code is compared against known accepted answers on-device.
// This keeps the app lightweight and avoids any sandbox/security risk.
export type QuestionKind = "mcq" | "predict_output" | "code_writing";

export type QuizQuestion = {
  id: string;
  type: QuestionKind;
  question: string;
  codeSnippet?: string; // shown in a monospace code block above the options (mcq/predict_output)
  options: string[]; // used for mcq / predict_output, empty [] for code_writing
  correctAnswer: string; // used for mcq / predict_output
  explanation: string; // shown after answering, right or wrong

  // --- code_writing only ---
  starterCode?: string; // pre-filled boilerplate shown in the editor
  acceptedAnswers?: string[]; // any of these (whitespace-normalized) counts as correct
  expectedOutput?: string; // simulated output shown after a correct check
};

export type TheorySlide = {
  heading: string;
  body: string;
  codeExample?: string;
};

export type TopicContent = {
  id: string; // globally unique, e.g. "basic_01"
  tab: TabKey;
  number: string;
  title: string;
  iconKey: IconKey;
  theorySlides: TheorySlide[];
  quiz: QuizQuestion[];
  xpReward: number;
};