import { TopicContent } from "./types";

export const DATA_SCIENCE_TOPICS: TopicContent[] = [
  {
    id: "ds_01",
    tab: "dataScience",
    number: "01",
    title: "What is\nData Science?",
    iconKey: "layers",
    xpReward: 15,
    theorySlides: [
      {
        heading: "Turning data into insight",
        body:
          "Data Science combines statistics, programming, and domain knowledge to find patterns and make decisions from raw data.",
      },
    ],
    quiz: [
      {
        id: "ds_01_q1",
        type: "mcq",
        question: "Which Python library is most used for tabular data analysis?",
        options: ["pandas", "expo", "mongoose", "clerk"],
        correctAnswer: "pandas",
        explanation: "pandas is the standard library for working with tabular data in Python.",
      },
      {
        id: "ds_01_code1",
        type: "code_writing",
        question: "Write code to import the pandas library using the common alias pd.",
        options: [],
        correctAnswer: "import pandas as pd",
        acceptedAnswers: ["import pandas as pd"],
        expectedOutput: "pandas is now available as pd",
        explanation: "pd is the near-universal alias used for pandas.",
      },
    ],
  },
  {
    id: "ds_02",
    tab: "dataScience",
    number: "02",
    title: "Reading a\nCSV File",
    iconKey: "box",
    xpReward: 15,
    theorySlides: [
      {
        heading: "pandas DataFrame",
        body:
          "A DataFrame is a table-like structure. You can load a CSV file into one with a single line of code.",
        codeExample: "import pandas as pd\ndf = pd.read_csv(\"data.csv\")\nprint(df.shape)",
      },
    ],
    quiz: [
      {
        id: "ds_02_q1",
        type: "mcq",
        question: "Which function loads a CSV file into a DataFrame?",
        options: ["pd.read_csv()", "pd.load()", "pd.open()", "pd.csv()"],
        correctAnswer: "pd.read_csv()",
        explanation: "pandas.read_csv() reads CSV data into a DataFrame.",
      },
      {
        id: "ds_02_code1",
        type: "code_writing",
        question: 'Read a file named "data.csv" into a DataFrame called df.',
        options: [],
        starterCode: "import pandas as pd\n",
        correctAnswer: 'df = pd.read_csv("data.csv")',
        acceptedAnswers: ['df = pd.read_csv("data.csv")', "df = pd.read_csv('data.csv')"],
        expectedOutput: "df now holds the CSV data",
        explanation: "pd.read_csv() loads a CSV file directly into a DataFrame.",
      },
    ],
  },
];