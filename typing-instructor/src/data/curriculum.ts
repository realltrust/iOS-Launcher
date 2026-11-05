import type { LessonDef } from '../types';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const drill = (keys: string[], n = 12) =>
  Array.from({ length: n }, () => pick(keys)).join(' ');

const COMMON = ('the be of and a to in he have it that for they i with as not on she at by this we you do but from or ' +
  'which one would all will there say who make when can more if no man out other so what time up go about than into could ' +
  'state only new year some take come these know see use get like then first any work now may such give over think most ' +
  'even find day also after way many must look before great back through years much where your').split(' ');

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice every day to build muscle memory and speed.',
  'Accuracy comes before speed in professional typing.',
  'A journey of a thousand miles begins with a single step.',
  'Keep your wrists relaxed and your fingers curved.',
  'Type with rhythm and let your eyes lead the way.',
];

const PARAGRAPHS = [
  'Professional typing is not only about speed. It is about accuracy, rhythm, and control. A typist who types slowly but accurately will finish a document before one who races ahead and makes mistakes. Build the habit of reading a few words ahead while your fingers follow the rhythm of the keyboard.',
  'When you first learn to touch type, your speed will feel slow. This is normal. Your brain is building new pathways. Each repetition strengthens the connection between the letter you see and the finger that presses it. Trust the process, and your speed will rise naturally.',
  'Business correspondence requires clear, concise language. Type your letters with care, checking names, dates, and figures. A single mistyped digit can change a quotation or a deadline. Accuracy is the professional standard.',
];

const PROGRAM = [
  'const sum = (a, b) => a + b;',
  'for (let i = 0; i < 10; i++) { console.log(i); }',
  'function greet(name) { return `Hello, ${name}!`; }',
  'if (user.isActive && user.role === "admin") { grantAccess(); }',
  'export default class User { constructor(id) { this.id = id; } }',
];

export const CURRICULUM: LessonDef[] = [
  { id: 'b-intro', level: 'beginner', title: 'Introduction to Typing', description: 'Learn posture, home row, and how this tutor works.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split('')) },
  { id: 'b-posture', level: 'beginner', title: 'Sitting Posture', description: 'Feet flat, back straight, wrists relaxed, fingers curved.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split('')) },
  { id: 'b-home', level: 'beginner', title: 'Home Row Keys', description: 'Place fingers on ASDF and JKL; — your anchor.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split(''), 16) },
  { id: 'b-left', level: 'beginner', title: 'Left-Hand Exercises', description: 'Focus on A S D F.', focusKeys: ['a','s','d','f'], generate: () => drill('asdf'.split(''), 16) },
  { id: 'b-right', level: 'beginner', title: 'Right-Hand Exercises', description: 'Focus on J K L ;.', focusKeys: ['j','k','l',';'], generate: () => drill('jkl;'.split(''), 16) },
  { id: 'b-fingers', level: 'beginner', title: 'Individual Finger Exercises', description: 'Strengthen each finger in turn.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split(''), 20) },
  { id: 'b-upper', level: 'beginner', title: 'Upper Row Keys', description: 'Reach up to Q W E R T Y U I O P.', focusKeys: ['q','w','e','r','t','y','u','i','o','p'], generate: () => drill('qwertyuiop'.split(''), 16) },
  { id: 'b-lower', level: 'beginner', title: 'Lower Row Keys', description: 'Reach down to Z X C V B N M.', focusKeys: ['z','x','c','v','b','n','m'], generate: () => drill('zxcvbnm'.split(''), 16) },
  { id: 'b-capital', level: 'beginner', title: 'Capital Letters', description: 'Use Shift with the opposite hand.', focusKeys: ['a','s','d','f','j','k','l'], generate: () => Array.from({length: 10}, () => pick(['As','Df','Jk','Ls','Fd','Kj','Sa','Dl'])).join(' ') },
  { id: 'b-shift', level: 'beginner', title: 'Shift Key Training', description: 'Alternate Shift hands while typing capitals.', focusKeys: ['a','s','d','f','j','k','l'], generate: () => Array.from({length: 10}, () => pick(['Aa','Ss','Dd','Ff','Jj','Kk','Ll'])).join(' ') },
  { id: 'b-space', level: 'beginner', title: 'Spacebar Training', description: 'Use your thumb for the spacebar.', focusKeys: [' '], generate: () => drill(['a','s','d','f','j','k','l'], 14) },
  { id: 'b-enter', level: 'beginner', title: 'Enter, Backspace, Tab', description: 'Practice control keys.', focusKeys: ['Enter','Backspace','Tab'], generate: () => 'a b c d e f g h i j k l m n o p' },
  { id: 'b-punct', level: 'beginner', title: 'Basic Punctuation', description: 'Period, comma, and semicolon.', focusKeys: ['.',',',';'], generate: () => drill(['a.','s,','d;','f.','j,','k;'], 12) },
  { id: 'b-numbers', level: 'beginner', title: 'Numbers', description: 'Reach up to the number row.', focusKeys: '1234567890'.split(''), generate: () => drill('1234567890'.split(''), 16) },

  { id: 'i-words', level: 'intermediate', title: 'Word Typing', description: 'Type common words smoothly.', focusKeys: [], generate: () => Array.from({length: 14}, () => pick(COMMON)).join(' ') },
  { id: 'i-sentence', level: 'intermediate', title: 'Sentence Typing', description: 'Complete full sentences.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-para', level: 'intermediate', title: 'Paragraph Typing', description: 'Type a paragraph without stopping.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'i-common', level: 'intermediate', title: 'Common English Words', description: 'The 100 most-used words.', focusKeys: [], generate: () => Array.from({length: 16}, () => pick(COMMON)).join(' ') },
  { id: 'i-combos', level: 'intermediate', title: 'Letter Combinations', description: 'Common pairs like th, er, in, on.', focusKeys: [], generate: () => drill('th er in on an re he st ed nd'.split(' '), 14) },
  { id: 'i-caps', level: 'intermediate', title: 'Capitalization Exercises', description: 'Capitalize names and sentence starts.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-punct', level: 'intermediate', title: 'Punctuation Exercises', description: 'Commas, quotes, and question marks.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-numbers', level: 'intermediate', title: 'Number Row Exercises', description: 'Numbers mixed with letters.', focusKeys: [], generate: () => Array.from({length: 12}, () => pick(['2024','42','100%','3.14','7:30','#5'])).join(' ') },
  { id: 'i-speed', level: 'intermediate', title: 'Speed Building', description: 'Push pace while staying accurate.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-accuracy', level: 'intermediate', title: 'Accuracy Improvement', description: 'Slow down and hit every key.', focusKeys: [], generate: () => pick(SENTENCES) },

  { id: 'a-passage', level: 'advanced', title: 'Long Passages', description: 'Type a full paragraph at speed.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-doc', level: 'advanced', title: 'Professional Documents', description: 'Formal document typing.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-business', level: 'advanced', title: 'Business Correspondence', description: 'Letters and memos.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-academic', level: 'advanced', title: 'Academic Typing', description: 'Research and citation text.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-programming', level: 'advanced', title: 'Programming Typing', description: 'Code syntax and symbols.', focusKeys: [], generate: () => pick(PROGRAM) },
  { id: 'a-advpunct', level: 'advanced', title: 'Advanced Punctuation', description: 'Brackets, quotes, and symbols.', focusKeys: [], generate: () => pick(PROGRAM) },
  { id: 'a-timed', level: 'advanced', title: 'Timed Challenge', description: 'Push for 60+ WPM.', focusKeys: [], generate: () => pick(PARAGRAPHS), minWpm: 60, minAccuracy: 95 },
  { id: 'a-speed', level: 'advanced', title: 'High-Speed Development', description: 'Maximum pace, minimum errors.', focusKeys: [], generate: () => pick(PARAGRAPHS), minWpm: 70, minAccuracy: 96 },
];
