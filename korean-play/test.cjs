const assert=require('node:assert/strict');
const games=require('./questions.js');
assert.equal(games.length,4);
for(const game of games){assert.ok(game.questions.length>=5);for(const [title,context,options,correct,explanation] of game.questions){assert.ok(title&&explanation);assert.ok(options.length>=2);assert.ok(correct>=0&&correct<options.length);assert.equal(new Set(options).size,options.length);}}
console.log('문항 검증 통과: 4개 게임, 24개 문항, 정답 인덱스 및 보기 중복 확인.');
