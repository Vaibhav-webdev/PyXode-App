import { TopicContent } from "./types";

export const AIML_TOPICS: TopicContent[] = [
  {
    id: "aiml_01",
    tab: "aiml",
    number: "01",
    title: "What is\nAI & ML?",
    iconKey: "sparkles",
    xpReward: 15,
    theorySlides: [
      {
        heading: "AI vs ML",
        body:
          "AI is the broad idea of machines performing tasks that need human-like intelligence. Machine Learning (ML) is a subset of AI where the system learns patterns from data instead of being explicitly programmed.",
      },
    ],
    quiz: [
      {
        id: "aiml_01_q1",
        type: "mcq",
        question: "Machine Learning is a subset of which broader field?",
        options: ["Web Development", "Artificial Intelligence", "Databases", "Networking"],
        correctAnswer: "Artificial Intelligence",
        explanation: "ML is one approach used to achieve AI.",
      },
      {
        id: "aiml_01_q2",
        type: "mcq",
        question: "Which library is most commonly used to start with ML in Python?",
        options: ["scikit-learn", "react-native", "express", "mongoose"],
        correctAnswer: "scikit-learn",
        explanation: "scikit-learn is a beginner-friendly Python ML library.",
      },
      {
        id: "aiml_01_code1",
        type: "code_writing",
        question: "Write code to import the numpy library using the common alias np.",
        options: [],
        correctAnswer: "import numpy as np",
        acceptedAnswers: ["import numpy as np"],
        expectedOutput: "numpy is now available as np",
        explanation: "`as` lets you import a module under a shorter alias.",
      },
    ],
  },
  {
    id: "aiml_02",
    tab: "aiml",
    number: "02",
    title: "NumPy\nBasics",
    iconKey: "layers",
    xpReward: 15,
    theorySlides: [
      {
        heading: "Arrays with NumPy",
        body:
          "NumPy is the foundation of most ML libraries. It lets you work with fast, multi-dimensional arrays.",
        codeExample: "import numpy as np\narr = np.array([1, 2, 3])\nprint(arr * 2)",
      },
    ],
    quiz: [
      {
        id: "aiml_02_q1",
        type: "predict_output",
        question: "What does this print?",
        codeSnippet: "import numpy as np\narr = np.array([1, 2, 3])\nprint(arr * 2)",
        options: ["[1 2 3]", "[2 4 6]", "[1, 2, 3, 1, 2, 3]", "Error"],
        correctAnswer: "[2 4 6]",
        explanation: "NumPy arrays multiply element-wise, unlike plain Python lists.",
      },
      {
        id: "aiml_02_code1",
        type: "code_writing",
        question: "Create a numpy array named arr from the list [1, 2, 3].",
        options: [],
        starterCode: "import numpy as np\n",
        correctAnswer: "arr = np.array([1, 2, 3])",
        acceptedAnswers: ["arr = np.array([1, 2, 3])", "arr=np.array([1,2,3])"],
        expectedOutput: "arr → [1 2 3]",
        explanation: "np.array() converts a Python list into a NumPy array.",
      },
    ],
  },
  {
    id: "aiml_03",
    tab: "aiml",
    number: "03",
    title: "Training vs\nTesting Data",
    iconKey: "box",
    xpReward: 15,
    theorySlides: [
      {
        heading: "Splitting your data",
        body:
          "Models learn from training data and are evaluated on unseen testing data, so we can trust how they'll perform in the real world.",
      },
    ],
    quiz: [
      {
        id: "aiml_03_q1",
        type: "mcq",
        question: "Why do we keep a separate test set?",
        options: [
          "To make training faster",
          "To check how the model performs on unseen data",
          "To store backup data",
          "It's not necessary",
        ],
        correctAnswer: "To check how the model performs on unseen data",
        explanation: "Testing on unseen data reveals if the model actually generalizes.",
      },
      {
        id: "aiml_03_code1",
        type: "code_writing",
        question: 'Print "Training complete" once your model has finished training.',
        options: [],
        correctAnswer: 'print("Training complete")',
        acceptedAnswers: ['print("Training complete")', "print('Training complete')"],
        expectedOutput: "Training complete",
        explanation: "A simple print statement is often used to log training progress.",
      },
    ],
  },
];