/**
 * 人教 PEP（三起）小学英语示例数据
 * 覆盖 3-6 年级上册，单元主题贴近真实 PEP 教材
 *
 * 说明：startTime/endTime/duration 为初始占位值，
 * 运行 scripts/generate-audio.mjs 后会被 TTS 实际时长自动校准。
 */

export interface SeedSentence {
  text: string;
  translation: string;
  startTime: number;
  endTime: number;
  speaker?: string;
}

export interface SeedExercise {
  type: "choice" | "fill" | "match";
  question: string;
  options?: string[] | { left: string[]; right: string[] };
  answer: string;
  explanation?: string;
  audioStartTime?: number;
}

export interface SeedLesson {
  part: string;
  title: string;
  type: "dialogue" | "story" | "chant" | "song" | "words";
  audioUrl: string;
  duration: number;
  icon: string;
  sentences: SeedSentence[];
  exercises: SeedExercise[];
}

export interface SeedUnit {
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: SeedLesson[];
}

export interface SeedGrade {
  level: number;
  name: string;
  semester: string;
  color: string;
  icon: string;
  units: SeedUnit[];
}

/** 占位时间戳（TTS 脚本会校准为真实值） */
const t = (i: number) => ({ startTime: i * 4, endTime: i * 4 + 3 });

export const pepContent: SeedGrade[] = [
  // ==================== 三年级 ====================
  {
    level: 3,
    name: "三年级",
    semester: "上册",
    color: "#3B82F6",
    icon: "🦁",
    units: [
      {
        number: 1,
        title: "Hello!",
        description: "学习打招呼和自我介绍",
        icon: "👋",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade3-u1-a.mp3",
            duration: 24,
            icon: "💬",
            sentences: [
              { text: "Hello!", translation: "你好！", ...t(0), speaker: "Miss White" },
              { text: "I'm Miss White.", translation: "我是怀特老师。", ...t(1), speaker: "Miss White" },
              { text: "Hi, I'm Sarah.", translation: "嗨，我是萨拉。", ...t(2), speaker: "Sarah" },
              { text: "Hello, I'm Mike.", translation: "你好，我是迈克。", ...t(3), speaker: "Mike" },
              { text: "Nice to meet you!", translation: "很高兴认识你！", ...t(4), speaker: "Sarah" },
              { text: "Nice to meet you, too!", translation: "我也很高兴认识你！", ...t(5), speaker: "Mike" },
              { text: "Goodbye!", translation: "再见！", ...t(6), speaker: "Miss White" },
            ],
            exercises: [
              { type: "choice", question: "听到 \"Hello, I'm Mike.\" 时，是谁在做自我介绍？", options: ["A. Sarah", "B. Mike", "C. Miss White"], answer: "B", explanation: "Mike 说 \"I'm Mike.\" 表示他是迈克。", audioStartTime: 12 },
              { type: "choice", question: "\"Nice to meet you\" 是什么意思？", options: ["A. 再见", "B. 谢谢", "C. 很高兴认识你"], answer: "C", explanation: "\"Nice to meet you\" 是初次见面时的礼貌用语。", audioStartTime: 16 },
              { type: "fill", question: "补全句子：___, I'm Sarah.", answer: "Hi", explanation: "打招呼时可用 Hi 或 Hello。" },
            ],
          },
          {
            part: "B",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade3-u1-b.mp3",
            duration: 18,
            icon: "🔤",
            sentences: [
              { text: "pencil", translation: "铅笔", ...t(0) },
              { text: "ruler", translation: "尺子", ...t(1) },
              { text: "eraser", translation: "橡皮", ...t(2) },
              { text: "crayon", translation: "蜡笔", ...t(3) },
              { text: "I have a pencil.", translation: "我有一支铅笔。", ...t(4) },
              { text: "Me too!", translation: "我也是！", ...t(5) },
            ],
            exercises: [
              { type: "match", question: "将单词与中文意思连线", options: { left: ["pencil", "ruler", "eraser"], right: ["橡皮", "铅笔", "尺子"] }, answer: JSON.stringify({ pencil: "铅笔", ruler: "尺子", eraser: "橡皮" }), explanation: "注意区分学习用品的英文单词。" },
              { type: "choice", question: "\"I have a pencil.\" 是什么意思？", options: ["A. 我有一支铅笔", "B. 我想要铅笔", "C. 铅笔在哪"], answer: "A", explanation: "\"I have\" 表示\"我有\"。", audioStartTime: 10 },
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Colours",
        description: "学习颜色单词",
        icon: "🎨",
        lessons: [
          {
            part: "A",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade3-u2-a.mp3",
            duration: 20,
            icon: "🌈",
            sentences: [
              { text: "red", translation: "红色", ...t(0) },
              { text: "yellow", translation: "黄色", ...t(1) },
              { text: "green", translation: "绿色", ...t(2) },
              { text: "blue", translation: "蓝色", ...t(3) },
              { text: "I see red.", translation: "我看到了红色。", ...t(4) },
              { text: "I see green.", translation: "我看到了绿色。", ...t(5) },
              { text: "What colour do you see?", translation: "你看到了什么颜色？", ...t(6) },
            ],
            exercises: [
              { type: "choice", question: "\"green\" 是什么颜色？", options: ["A. 红色", "B. 绿色", "C. 蓝色"], answer: "B", explanation: "green = 绿色。", audioStartTime: 4 },
              { type: "fill", question: "补全句子：I see ___. （我看到了蓝色）", answer: "blue", explanation: "蓝色是 blue。" },
            ],
          },
          {
            part: "B",
            title: "Let's chant",
            type: "chant",
            audioUrl: "/audio/grade3-u2-b.mp3",
            duration: 16,
            icon: "🎵",
            sentences: [
              { text: "Red, red, I like red.", translation: "红色，红色，我喜欢红色。", ...t(0) },
              { text: "Yellow, yellow, I like yellow.", translation: "黄色，黄色，我喜欢黄色。", ...t(1) },
              { text: "Green and blue,", translation: "绿色和蓝色，", ...t(2) },
              { text: "How about you?", translation: "你呢？", ...t(3) },
            ],
            exercises: [
              { type: "choice", question: "歌谣中提到了哪些颜色？", options: ["A. 红黄绿蓝", "B. 红黑白", "C. 紫粉橙"], answer: "A", explanation: "歌谣依次提到了 red, yellow, green, blue。" },
              { type: "fill", question: "补全：How about ___? （你呢？）", answer: "you", explanation: "询问对方用 you。" },
            ],
          },
        ],
      },
      {
        number: 3,
        title: "Look at me!",
        description: "学习身体部位",
        icon: "😊",
        lessons: [
          {
            part: "A",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade3-u3-a.mp3",
            duration: 18,
            icon: "👁️",
            sentences: [
              { text: "face", translation: "脸", ...t(0) },
              { text: "ear", translation: "耳朵", ...t(1) },
              { text: "eye", translation: "眼睛", ...t(2) },
              { text: "nose", translation: "鼻子", ...t(3) },
              { text: "mouth", translation: "嘴巴", ...t(4) },
              { text: "Look at me!", translation: "看着我！", ...t(5) },
              { text: "This is my face.", translation: "这是我的脸。", ...t(6) },
            ],
            exercises: [
              { type: "match", question: "将身体部位单词与中文连线", options: { left: ["eye", "nose", "mouth"], right: ["鼻子", "嘴巴", "眼睛"] }, answer: JSON.stringify({ eye: "眼睛", nose: "鼻子", mouth: "嘴巴" }), explanation: "eye=眼睛, nose=鼻子, mouth=嘴巴。" },
              { type: "choice", question: "\"Look at me!\" 是什么意思？", options: ["A. 看着我", "B. 听我说", "C. 跟我走"], answer: "A", explanation: "look at = 看……；me = 我。", audioStartTime: 20 },
            ],
          },
        ],
      },
    ],
  },
  // ==================== 四年级 ====================
  {
    level: 4,
    name: "四年级",
    semester: "上册",
    color: "#10B981",
    icon: "🐰",
    units: [
      {
        number: 1,
        title: "My classroom",
        description: "学习教室里的物品",
        icon: "🏫",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade4-u1-a.mp3",
            duration: 22,
            icon: "💬",
            sentences: [
              { text: "What's in the classroom?", translation: "教室里有什么？", ...t(0), speaker: "Teacher" },
              { text: "One blackboard.", translation: "一块黑板。", ...t(1), speaker: "Amy" },
              { text: "One TV.", translation: "一台电视。", ...t(2), speaker: "Amy" },
              { text: "Many desks and chairs.", translation: "许多桌椅。", ...t(3), speaker: "Amy" },
              { text: "Where is it?", translation: "它在哪儿？", ...t(4), speaker: "Teacher" },
              { text: "It's near the window.", translation: "在窗户旁边。", ...t(5), speaker: "Amy" },
            ],
            exercises: [
              { type: "choice", question: "教室里有几块黑板？", options: ["A. 两块", "B. 一块", "C. 没有"], answer: "B", explanation: "Amy 说 \"One blackboard\" 即一块。", audioStartTime: 4 },
              { type: "choice", question: "\"near the window\" 是什么意思？", options: ["A. 在门边", "B. 在窗户旁", "C. 在桌下"], answer: "B", explanation: "near = 在……旁边，window = 窗户。", audioStartTime: 19 },
            ],
          },
          {
            part: "B",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade4-u1-b.mp3",
            duration: 18,
            icon: "📐",
            sentences: [
              { text: "classroom", translation: "教室", ...t(0) },
              { text: "window", translation: "窗户", ...t(1) },
              { text: "picture", translation: "图画", ...t(2) },
              { text: "door", translation: "门", ...t(3) },
              { text: "board", translation: "黑板", ...t(4) },
              { text: "This is a door.", translation: "这是一扇门。", ...t(5) },
            ],
            exercises: [
              { type: "match", question: "将教室物品单词与中文连线", options: { left: ["window", "door", "picture"], right: ["门", "图画", "窗户"] }, answer: JSON.stringify({ window: "窗户", door: "门", picture: "图画" }), explanation: "注意区分教室物品。" },
              { type: "fill", question: "补全：This is a ___. （这是一扇窗户）", answer: "window", explanation: "窗户是 window。" },
            ],
          },
        ],
      },
      {
        number: 2,
        title: "My schoolbag",
        description: "学习学习用品",
        icon: "🎒",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade4-u2-a.mp3",
            duration: 20,
            icon: "💬",
            sentences: [
              { text: "What's in your schoolbag?", translation: "你的书包里有什么？", ...t(0), speaker: "Tom" },
              { text: "An English book.", translation: "一本英语书。", ...t(1), speaker: "Lily" },
              { text: "A maths book.", translation: "一本数学书。", ...t(2), speaker: "Lily" },
              { text: "Three notebooks.", translation: "三个笔记本。", ...t(3), speaker: "Lily" },
              { text: "What colour is it?", translation: "它是什么颜色的？", ...t(4), speaker: "Tom" },
              { text: "It's blue and white.", translation: "蓝白相间。", ...t(5), speaker: "Lily" },
            ],
            exercises: [
              { type: "choice", question: "书包里有多少个笔记本？", options: ["A. 一个", "B. 两个", "C. 三个"], answer: "C", explanation: "Lily 说 \"Three notebooks\" 即三个。", audioStartTime: 12 },
              { type: "fill", question: "补全：What ___ is it? （它是什么颜色的？）", answer: "colour", explanation: "询问颜色用 what colour。" },
            ],
          },
        ],
      },
    ],
  },
  // ==================== 五年级 ====================
  {
    level: 5,
    name: "五年级",
    semester: "上册",
    color: "#F59E0B",
    icon: "🦊",
    units: [
      {
        number: 1,
        title: "What's he like?",
        description: "描述人物外貌和性格",
        icon: "🧑",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade5-u1-a.mp3",
            duration: 22,
            icon: "💬",
            sentences: [
              { text: "Who's that young lady?", translation: "那位年轻的女士是谁？", ...t(0), speaker: "Chen Jie" },
              { text: "She's Miss Wang.", translation: "她是王老师。", ...t(1), speaker: "John" },
              { text: "Is she strict?", translation: "她严格吗？", ...t(2), speaker: "Chen Jie" },
              { text: "Yes, she is.", translation: "是的，她是。", ...t(3), speaker: "John" },
              { text: "But she's very kind.", translation: "但她很和蔼。", ...t(4), speaker: "John" },
              { text: "She's our music teacher.", translation: "她是我们的音乐老师。", ...t(5), speaker: "John" },
            ],
            exercises: [
              { type: "choice", question: "\"strict\" 是什么意思？", options: ["A. 友好的", "B. 严格的", "C. 懒惰的"], answer: "B", explanation: "strict = 严格的。", audioStartTime: 8 },
              { type: "choice", question: "Miss Wang 是什么老师？", options: ["A. 数学老师", "B. 音乐老师", "C. 体育老师"], answer: "B", explanation: "John 说 \"She's our music teacher.\"", audioStartTime: 20 },
              { type: "fill", question: "补全：Is she ___? （她严格吗？）", answer: "strict", explanation: "strict = 严格的。" },
            ],
          },
          {
            part: "B",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade5-u1-b.mp3",
            duration: 18,
            icon: "📝",
            sentences: [
              { text: "old", translation: "老的", ...t(0) },
              { text: "young", translation: "年轻的", ...t(1) },
              { text: "funny", translation: "滑稽好笑的", ...t(2) },
              { text: "kind", translation: "体贴的", ...t(3) },
              { text: "polite", translation: "有礼貌的", ...t(4) },
              { text: "My grandpa is old but kind.", translation: "我爷爷年纪大了但很和蔼。", ...t(5) },
            ],
            exercises: [
              { type: "match", question: "将性格词与中文连线", options: { left: ["funny", "kind", "polite"], right: ["有礼貌的", "滑稽的", "体贴的"] }, answer: JSON.stringify({ funny: "滑稽的", kind: "体贴的", polite: "有礼貌的" }), explanation: "区分描述性格的形容词。" },
              { type: "choice", question: "\"polite\" 是什么意思？", options: ["A. 有礼貌的", "B. 调皮的", "C. 安静的"], answer: "A", explanation: "polite = 有礼貌的。", audioStartTime: 16 },
            ],
          },
        ],
      },
      {
        number: 2,
        title: "My week",
        description: "学习星期和课程",
        icon: "📅",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade5-u2-a.mp3",
            duration: 20,
            icon: "💬",
            sentences: [
              { text: "What do you have on Mondays?", translation: "你周一有什么课？", ...t(0), speaker: "Mom" },
              { text: "We have Chinese and maths.", translation: "我们有语文和数学。", ...t(1), speaker: "David" },
              { text: "What about Fridays?", translation: "周五呢？", ...t(2), speaker: "Mom" },
              { text: "We have English and PE.", translation: "我们有英语和体育。", ...t(3), speaker: "David" },
              { text: "I love Fridays!", translation: "我爱周五！", ...t(4), speaker: "David" },
            ],
            exercises: [
              { type: "choice", question: "周一有什么课？", options: ["A. 语文和数学", "B. 英语和体育", "C. 音乐和美术"], answer: "A", explanation: "David 说周一有 Chinese and maths。", audioStartTime: 4 },
              { type: "fill", question: "补全：What do you have ___ Mondays? （周一你有什么课？）", answer: "on", explanation: "表示在星期几用介词 on。" },
            ],
          },
        ],
      },
    ],
  },
  // ==================== 六年级 ====================
  {
    level: 6,
    name: "六年级",
    semester: "上册",
    color: "#EF4444",
    icon: "🦉",
    units: [
      {
        number: 1,
        title: "How do you go there?",
        description: "学习交通方式",
        icon: "🚲",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade6-u1-a.mp3",
            duration: 22,
            icon: "💬",
            sentences: [
              { text: "How do you go to school?", translation: "你怎么去上学？", ...t(0), speaker: "Mike" },
              { text: "Usually I go on foot.", translation: "通常我步行去。", ...t(1), speaker: "Sarah" },
              { text: "Sometimes I go by bike.", translation: "有时我骑自行车去。", ...t(2), speaker: "Sarah" },
              { text: "How about you?", translation: "你呢？", ...t(3), speaker: "Sarah" },
              { text: "I go by bus.", translation: "我坐公交车。", ...t(4), speaker: "Mike" },
              { text: "It's fast and cheap.", translation: "又快又便宜。", ...t(5), speaker: "Mike" },
            ],
            exercises: [
              { type: "choice", question: "Sarah 通常怎么上学？", options: ["A. 步行", "B. 骑车", "C. 坐公交"], answer: "A", explanation: "Sarah 说 \"Usually I go on foot\" 即通常步行。", audioStartTime: 4 },
              { type: "choice", question: "Mike 觉得公交车怎么样？", options: ["A. 又快又便宜", "B. 又慢又贵", "C. 拥挤"], answer: "A", explanation: "Mike 说 \"It's fast and cheap.\"", audioStartTime: 20 },
              { type: "fill", question: "补全：I go ___ bus. （我坐公交车）", answer: "by", explanation: "表示交通方式用 by + 交通工具。" },
            ],
          },
          {
            part: "B",
            title: "Let's learn",
            type: "words",
            audioUrl: "/audio/grade6-u1-b.mp3",
            duration: 16,
            icon: "🚦",
            sentences: [
              { text: "on foot", translation: "步行", ...t(0) },
              { text: "by bike", translation: "骑自行车", ...t(1) },
              { text: "by bus", translation: "坐公交车", ...t(2) },
              { text: "by subway", translation: "坐地铁", ...t(3) },
              { text: "by train", translation: "坐火车", ...t(4) },
            ],
            exercises: [
              { type: "match", question: "将交通方式与中文连线", options: { left: ["on foot", "by subway", "by train"], right: ["坐地铁", "步行", "坐火车"] }, answer: JSON.stringify({ "on foot": "步行", "by subway": "坐地铁", "by train": "坐火车" }), explanation: "区分不同交通方式的英文表达。" },
              { type: "choice", question: "\"by subway\" 是什么意思？", options: ["A. 步行", "B. 坐地铁", "C. 骑车"], answer: "B", explanation: "subway = 地铁。", audioStartTime: 12 },
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Where is the science museum?",
        description: "学习问路和方位",
        icon: "🗺️",
        lessons: [
          {
            part: "A",
            title: "Let's talk",
            type: "dialogue",
            audioUrl: "/audio/grade6-u2-a.mp3",
            duration: 20,
            icon: "💬",
            sentences: [
              { text: "Excuse me, where is the museum?", translation: "打扰一下，博物馆在哪里？", ...t(0), speaker: "Boy" },
              { text: "It's near the park.", translation: "在公园附近。", ...t(1), speaker: "Woman" },
              { text: "How can I get there?", translation: "我怎么去那里？", ...t(2), speaker: "Boy" },
              { text: "Go straight and turn left.", translation: "直走然后左转。", ...t(3), speaker: "Woman" },
              { text: "Thank you very much.", translation: "非常感谢。", ...t(4), speaker: "Boy" },
              { text: "You're welcome.", translation: "不客气。", ...t(5), speaker: "Woman" },
            ],
            exercises: [
              { type: "choice", question: "博物馆在哪里？", options: ["A. 公园附近", "B. 学校旁边", "C. 商店后面"], answer: "A", explanation: "女士说 \"It's near the park.\"", audioStartTime: 4 },
              { type: "fill", question: "补全：Go ___ and turn left. （直走然后左转）", answer: "straight", explanation: "straight = 笔直地。" },
            ],
          },
        ],
      },
    ],
  },
];
