const usernamePattern=/^[a-z0-9]{4,20}$/;
function accountEmail(value){const id=String(value).trim().toLowerCase();if(!usernamePattern.test(id))throw Error('아이디는 영문 소문자·숫자 4~20자로 입력해 주세요.');return id+'@students.malnori.invalid';}
function validatePassword(value){if(typeof value!=='string'||value.length<8||value.length>128)throw Error('비밀번호는 8~128자로 입력해 주세요.');return value;}
function validateRecord(record){if(!/^[0-9a-f-]{36}$/i.test(record.id)||!['spelling','spacing','vocabulary','proverbs','daily'].includes(record.game_id)||!Number.isInteger(record.correct_count)||record.correct_count<0||record.correct_count>5)throw Error('학습 기록 형식이 올바르지 않습니다.');return {id:record.id,game_id:record.game_id,correct_count:record.correct_count};}
module.exports={accountEmail,validatePassword,validateRecord};
