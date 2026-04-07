const xlsx = require('xlsx');
const path = require('path');

// Sample quiz data
const questions = [
  { Question: 'What is JavaScript?', Option1: 'A Programming Language', Option2: 'An Operating System', Option3: 'A Database', Option4: 'A Hardware', Correct: 'A Programming Language' },
  { Question: 'Which keyword declares a variable in JS?', Option1: 'var', Option2: 'int', Option3: 'string', Option4: 'dim', Correct: 'var' },
  { Question: 'What does DOM stand for?', Option1: 'Document Object Model', Option2: 'Data Object Model', Option3: 'Document Order Method', Option4: 'Digital Object Memory', Correct: 'Document Object Model' },
  { Question: 'Which is NOT a JS data type?', Option1: 'String', Option2: 'Boolean', Option3: 'Float', Option4: 'Undefined', Correct: 'Float' },
  { Question: 'Which symbols are used for comments in JS?', Option1: '//', Option2: '/* */', Option3: '<!-- -->', Option4: '#', Correct: '//,/* */' },
  { Question: 'What is NaN?', Option1: 'Not a Number', Option2: 'Null and None', Option3: 'New Array Notation', Option4: 'No Active Node', Correct: 'Not a Number' },
  { Question: 'Which method converts JSON to a JS object?', Option1: 'JSON.parse()', Option2: 'JSON.stringify()', Option3: 'JSON.convert()', Option4: 'JSON.toObject()', Correct: 'JSON.parse()' },
  { Question: 'What is the output of typeof null?', Option1: 'object', Option2: 'null', Option3: 'undefined', Option4: 'string', Correct: 'object' },
  { Question: 'Which company developed JavaScript?', Option1: 'Netscape', Option2: 'Microsoft', Option3: 'Google', Option4: 'Apple', Correct: 'Netscape' },
  { Question: 'Which are valid loop types in JS?', Option1: 'for', Option2: 'while', Option3: 'repeat', Option4: 'do-while', Correct: 'for,while,do-while' }
];

const ws = xlsx.utils.json_to_sheet(questions);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Questions');

const filePath = path.join(__dirname, 'sample_quiz.xlsx');
xlsx.writeFile(wb, filePath);
console.log(`Sample quiz file created at: ${filePath}`);
console.log(`Total questions: ${questions.length}`);
console.log('Note: Questions 5 and 10 are multi-correct (MCQ) type');
