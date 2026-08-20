import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const page=await readFile(new URL("../app/page.tsx",import.meta.url),"utf8");
const storage=await readFile(new URL("../app/data-storage.ts",import.meta.url),"utf8");
const career=await readFile(new URL("../app/career-content.ts",import.meta.url),"utf8");
const learning=await readFile(new URL("../app/learning-expansion.ts",import.meta.url),"utf8");
const ielts=await readFile(new URL("../app/ielts-expansion.ts",import.meta.url),"utf8");

test("uses IndexedDB as the primary high-capacity store",()=>{
  assert.match(storage,/indexedDB\.open/);
  assert.match(page,/readPrimaryData/);
  assert.match(page,/writePrimaryData/);
  assert.doesNotMatch(page,/removeItem\(BACKUP_KEY\)/);
});

test("daily language rotations are varied and care periods remain editable",()=>{
  assert.ok((ielts.match(/word:/g)||[]).length>=70);
  assert.ok((ielts.match(/IELTS_EXPANSION_TRANSLATIONS|:[\"“]/g)||[]).length>=1);
  assert.doesNotMatch(page,/items:\["今日 10 个韩语单词"/);
  assert.doesNotMatch(page,/口语任务：先听示范/);
  assert.match(page,/cat-care-check/);
  assert.doesNotMatch(page,/cat-care-time-controls/);
});

test("normal startup no longer clears whole user collections",()=>{
  assert.doesNotMatch(page,/shouldCleanGrowth\s*\?\s*\[\]/);
  assert.doesNotMatch(page,/!shouldCleanBirthdays/);
  assert.match(page,/goals:\s*\(Array\.isArray\(parsed\.goals\)/);
  assert.match(page,/periods:\s*Array\.isArray\(parsed\.periods\)/);
  assert.match(page,/financeEntries:\s*cleanFinance\.financeEntries/);
});

test("JSON merge retains high-volume collections",()=>{
  for(const key of ["events","todos","memos","periods","financeEntries","goals","specialDays","catCare","moodEntries"]){
    assert.match(page,new RegExp(`${key}: merge\\(`),`missing merge for ${key}`);
  }
});

test("career plans route to topic-specific lessons and learning rotation is expanded",()=>{
  assert.match(career,/PLAN_TOPIC_ALIASES/);
  assert.match(career,/Web Components 是浏览器原生/);
  assert.match(learning,/试用期员工/);
  assert.match(learning,/ROE/);
  assert.match(learning,/钢笔工具/);
  assert.match(learning,/求职与面试/);
  assert.match(learning,/长期股权投资/);
});
