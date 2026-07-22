import { TopicContent } from "./types";

export const APP_DEV_TOPICS: TopicContent[] = [
  {
    id: "app_01",
    tab: "appDev",
    number: "01",
    title: "Python in\nApp Backends",
    iconKey: "box",
    xpReward: 15,
    theorySlides: [
      {
        heading: "Where Python fits in",
        body:
          "Mobile apps usually talk to a backend server over an API. Python (via Flask/Django/FastAPI) is a popular choice for building that backend.",
      },
    ],
    quiz: [
      {
        id: "app_01_q1",
        type: "mcq",
        question: "A mobile app usually communicates with a Python backend using:",
        options: ["A REST API", "Bluetooth", "USB cable", "SMS"],
        correctAnswer: "A REST API",
        explanation: "REST APIs over HTTP are the standard way apps talk to backends.",
      },
      {
        id: "app_01_code1",
        type: "code_writing",
        question: 'Print "API ready" to simulate a backend finishing startup.',
        options: [],
        correctAnswer: 'print("API ready")',
        acceptedAnswers: ['print("API ready")', "print('API ready')"],
        expectedOutput: "API ready",
        explanation: "print() is commonly used to log service status during startup.",
      },
    ],
  },
  {
    id: "app_02",
    tab: "appDev",
    number: "02",
    title: "JSON &\nAPIs",
    iconKey: "braces",
    xpReward: 15,
    theorySlides: [
      {
        heading: "Why JSON?",
        body:
          "JSON is the common language apps and servers use to exchange data — lightweight, readable, and easy to parse in almost any language.",
        codeExample: 'import json\ndata = {"name": "Aman"}\nprint(json.dumps(data))',
      },
    ],
    quiz: [
      {
        id: "app_02_q1",
        type: "mcq",
        question: "What format do most mobile apps use to exchange data with a server?",
        options: ["JSON", "DOCX", "MP3", "EXE"],
        correctAnswer: "JSON",
        explanation: "JSON is the standard data-interchange format for APIs.",
      },
      {
        id: "app_02_code1",
        type: "code_writing",
        question: "Write code to import the json module.",
        options: [],
        correctAnswer: "import json",
        acceptedAnswers: ["import json"],
        expectedOutput: "json is now available",
        explanation: "The built-in json module handles converting data to/from JSON.",
      },
    ],
  },
];