export type ScreeningQuestion = {
  id: number;
  text: string;
};

export type ScreeningResponse = {
  value: number;
  text: string;
};

export type ScreeningTool = {
  name: string;
  purpose: string;
  timeframe: string;
  questions: ScreeningQuestion[];
  responses: ScreeningResponse[];
  scoring: { [range: string]: string };
};

export type Counselor = {
  id: number;
  name: string;
  specialty: string;
  languages: string[];
  available: boolean;
  avatar: string;
};

export type Resource = {
  category: 'Depression' | 'Anxiety' | 'Stress' | 'Sleep' | 'Crisis' | 'Games';
  title: string;
  type: 'article' | 'video' | 'audio' | 'guide' | 'game';
  description: string;
  image: string;
};

export type Helpline = {
  name: string;
  number: string;
  hours: string;
};

export const mentalHealthData = {
  phq9: {
    name: "Patient Health Questionnaire-9 (PHQ-9)",
    purpose: "Depression screening and severity assessment",
    timeframe: "Over the last 2 weeks",
    questions: [
      { id: 1, text: "Little interest or pleasure in doing things" },
      { id: 2, text: "Feeling down, depressed, irritable, or hopeless" },
      { id: 3, text: "Trouble falling asleep, staying asleep, or sleeping too much" },
      { id: 4, text: "Feeling tired or having little energy" },
      { id: 5, text: "Poor appetite or overeating" },
      { id: 6, text: "Feeling bad about yourself or that you are a failure or have let yourself or your family down" },
      { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
      { id: 8, text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual" },
      { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way" },
    ],
    responses: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" },
    ],
    scoring: {
      "0-4": "Minimal depression",
      "5-9": "Mild depression",
      "10-14": "Moderate depression",
      "15-19": "Moderately severe depression",
      "20-27": "Severe depression",
    },
  } as ScreeningTool,
  gad7: {
    name: "Generalized Anxiety Disorder-7 (GAD-7)",
    purpose: "Anxiety screening and severity assessment",
    timeframe: "Over the last 2 weeks",
    questions: [
      { id: 1, text: "Feeling nervous, anxious or on edge" },
      { id: 2, text: "Not being able to stop or control worrying" },
      { id: 3, text: "Worrying too much about different things" },
      { id: 4, text: "Trouble relaxing" },
      { id: 5, text: "Being so restless that it's hard to sit still" },
      { id: 6, text: "Becoming easily annoyed or irritable" },
      { id: 7, text: "Feeling afraid, as if something awful might happen" },
    ],
    responses: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" },
    ],
    scoring: {
      "0-4": "Minimal anxiety",
      "5-9": "Mild anxiety",
      "10-14": "Moderate anxiety",
      "15-21": "Severe anxiety",
    },
  } as ScreeningTool,
  counselors: [
    { id: 1, name: "Dr. Priya Sharma", specialty: "Depression & Anxiety", languages: ["English", "Hindi"], available: true, avatar: "1" },
    { id: 2, name: "Dr. Rajesh Kumar", specialty: "Student Stress", languages: ["English", "Bengali"], available: true, avatar: "2" },
    { id: 3, name: "Dr. Anita Patel", specialty: "Crisis Intervention", languages: ["English", "Gujarati"], available: false, avatar: "3" },
    { id: 4, name: "Dr. Suresh Reddy", specialty: "Peer Relationships", languages: ["English", "Telugu"], available: true, avatar: "4" },
  ] as Counselor[],
  resources: [
    { category: "Depression", title: "Understanding Depression in Students", type: "article", description: "An in-depth look at the signs, symptoms, and causes of depression among students.", image: "1"},
    { category: "Anxiety", title: "Managing Test Anxiety", type: "video", description: "A video guide with practical tips to handle anxiety before and during exams.", image: "2"},
    { category: "Stress", title: "Guided Relaxation for Students", type: "audio", description: "A calming audio session to help you unwind and reduce academic stress.", image: "3"},
    { category: "Sleep", title: "The Student's Guide to Better Sleep", type: "guide", description: "Comprehensive guide on improving sleep hygiene for better academic performance.", image: "4"},
    { category: "Crisis", title: "Immediate Steps in a Crisis", type: "guide", description: "A clear, concise guide on what to do if you or a friend is in a mental health crisis.", image: "5"},
    { category: "Depression", title: "CBT Basics for Low Mood", type: "video", description: "An introductory video to Cognitive Behavioral Therapy techniques for depression.", image: "6"},
    { category: "Anxiety", title: "Box Breathing Exercise", type: "audio", description: "A simple and powerful breathing exercise to quickly calm anxiety.", image: "7"},
    { category: "Stress", title: "Effective Time Management", type: "article", description: "Learn how to manage your time effectively to reduce stress and improve focus.", image: "8"},
    { category: "Games", title: "Mindful Maze", type: "game", description: "Navigate a calming maze to practice focus and mindfulness.", image: "9" },
    { category: "Games", title: "Pattern Flow", type: "game", description: "Connect the dots to create beautiful patterns, a relaxing and creative exercise.", image: "10" }
  ] as Resource[],
  helplines: [
    { name: "KIRAN Mental Health Helpline", number: "1800-599-0019", hours: "24/7" },
    { name: "Vandrevala Foundation", number: "9999-666-555", hours: "24/7" },
    { name: "CBSE Student Helpline", number: "1800-11-8004", hours: "Business hours" },
  ] as Helpline[],
};
