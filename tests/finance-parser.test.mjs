import test from "node:test";
import assert from "node:assert/strict";
import { parseFinanceText } from "../app/finance-parser.ts";

const now=new Date("2026-08-21T12:00:00+08:00");
const expected={date:"2026-08-02",time:"13:00",amount:20,type:"expense",category:"水果",note:"草莓"};
test("parses dashed and slashed dates without leaking separators into notes",()=>{
  assert.deepEqual(parseFinanceText("2026-08-02 13:00 草莓 20",now),expected);
  assert.deepEqual(parseFinanceText(" 2026/08/02 13:00 草莓 20 ",now),expected);
});
test("recognizes transport, drinks, accessories and clothing",()=>{
  assert.equal(parseFinanceText("8月7日17:52电单车3",now)?.category,"交通");
  for(const word of ["拿铁","美式"])assert.equal(parseFinanceText(`${word} 20`,now)?.category,"饮品");
  assert.equal(parseFinanceText("项链 20",now)?.category,"饰品");
  for(const word of ["内衣","短袖","牛仔短裤"])assert.equal(parseFinanceText(`${word} 20`,now)?.category,"服饰");
});
