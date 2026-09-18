/* 案例数据总入口：合并各场景分册，按「场景:分类」索引 */
import { META } from './meta.js';
import { OFFICE } from './office.js';
import { OFFICE2 } from './office2.js';
import { OFFICE3 } from './office3.js';
import { CODE } from './code.js';
import { DESIGN } from './design.js';
import { DESIGN2 } from './design2.js';

const ALL = {};
Object.keys(META).forEach((k) => { ALL[k] = []; });

const merge = (scene, ...books) => books.forEach((book) => {
  Object.entries(book).forEach(([chip, arr]) => {
    ALL[`${scene}:${chip}`] = arr;
  });
});

merge('office', OFFICE, OFFICE2, OFFICE3);
merge('code', CODE);
merge('design', DESIGN, DESIGN2);

import { DEEP_WEEKLY } from './deep/weekly.js';
import { DEEP_WEEKLY_2 } from './deep/weekly2.js';
import { DEEP_WEEKLY_3 } from './deep/weekly3.js';
import { DEEP_MINUTES_1 } from './deep/minutes1.js';
import { DEEP_MINUTES_2 } from './deep/minutes2.js';
import { DEEP_MINUTES_3 } from './deep/minutes3.js';
import { DEEP_EMAIL_1 } from './deep/email1.js';
import { DEEP_EMAIL_2 } from './deep/email2.js';
import { DEEP_EMAIL_3 } from './deep/email3.js';
import { DEEP_EMAIL_4 } from './deep/email4.js';
import { DEEP_EMAIL_5 } from './deep/email5.js';
import { DEEP_EMAIL_6 } from './deep/email6.js';
import { DEEP_FILES_1 } from './deep/files1.js';
import { DEEP_FILES_2 } from './deep/files2.js';
import { DEEP_FILES_3 } from './deep/files3.js';
import { DEEP_FILES_4 } from './deep/files4.js';
import { DEEP_FILES_5 } from './deep/files5.js';
import { DEEP_FILES_6 } from './deep/files6.js';
import { DEEP_INVOICE_1 } from './deep/invoice1.js';
import { DEEP_CONTRACT_1 } from './deep/contract1.js';
import { DEEP_CONTRACT_2 } from './deep/contract2.js';
import { DEEP_CONTRACT_3 } from './deep/contract3.js';
import { DEEP_CONTRACT_4 } from './deep/contract4.js';
import { DEEP_CONTRACT_5 } from './deep/contract5.js';
import { DEEP_CONTRACT_6 } from './deep/contract6.js';
import { DEEP_NOTICE_1 } from './deep/notice1.js';
import { DEEP_NOTICE_2 } from './deep/notice2.js';
import { DEEP_NOTICE_3 } from './deep/notice3.js';
import { DEEP_NOTICE_4 } from './deep/notice4.js';
import { DEEP_NOTICE_5 } from './deep/notice5.js';
import { DEEP_NOTICE_6 } from './deep/notice6.js';
import { DEEP_SCHEDULE_1 } from './deep/schedule1.js';
import { DEEP_SCHEDULE_2 } from './deep/schedule2.js';
import { DEEP_SCHEDULE_3 } from './deep/schedule3.js';
import { DEEP_SCHEDULE_4 } from './deep/schedule4.js';
import { DEEP_SCHEDULE_5 } from './deep/schedule5.js';
import { DEEP_SCHEDULE_6 } from './deep/schedule6.js';
import { DEEP_REVIEW_1 } from './deep/review1.js';
import { DEEP_REVIEW_2 } from './deep/review2.js';
import { DEEP_REVIEW_3 } from './deep/review3.js';
import { DEEP_REVIEW_4 } from './deep/review4.js';
import { DEEP_REVIEW_5 } from './deep/review5.js';
import { DEEP_REVIEW_6 } from './deep/review6.js';
import { DEEP_BUG_1 } from './deep/bug1.js';
import { DEEP_BUG_2 } from './deep/bug2.js';
import { DEEP_BUG_3 } from './deep/bug3.js';
import { DEEP_BUG_4 } from './deep/bug4.js';
import { DEEP_BUG_5 } from './deep/bug5.js';
import { DEEP_BUG_6 } from './deep/bug6.js';
import { DEEP_UTEST_1 } from './deep/utest1.js';
import { DEEP_UTEST_2 } from './deep/utest2.js';
import { DEEP_UTEST_3 } from './deep/utest3.js';
import { DEEP_UTEST_4 } from './deep/utest4.js';
import { DEEP_UTEST_5 } from './deep/utest5.js';
import { DEEP_UTEST_6 } from './deep/utest6.js';
import { DEEP_README_1 } from './deep/readme1.js';
import { DEEP_README_2 } from './deep/readme2.js';
import { DEEP_README_3 } from './deep/readme3.js';
import { DEEP_README_4 } from './deep/readme4.js';
import { DEEP_README_5 } from './deep/readme5.js';
import { DEEP_README_6 } from './deep/readme6.js';
import { DEEP_SCRIPT_1 } from './deep/script1.js';
import { DEEP_SCRIPT_2 } from './deep/script2.js';
import { DEEP_SCRIPT_3 } from './deep/script3.js';
import { DEEP_SCRIPT_4 } from './deep/script4.js';
import { DEEP_SCRIPT_5 } from './deep/script5.js';
import { DEEP_SCRIPT_6 } from './deep/script6.js';
import { DEEP_SQL_1 } from './deep/sql1.js';
import { DEEP_SQL_2 } from './deep/sql2.js';
import { DEEP_SQL_3 } from './deep/sql3.js';
import { DEEP_SQL_4 } from './deep/sql4.js';
import { DEEP_SQL_5 } from './deep/sql5.js';
import { DEEP_SQL_6 } from './deep/sql6.js';









import { DEEP_INVOICE_2 } from './deep/invoice2.js';
import { DEEP_INVOICE_3 } from './deep/invoice3.js';
import { DEEP_INVOICE_4 } from './deep/invoice4.js';
import { DEEP_INVOICE_5 } from './deep/invoice5.js';
import { DEEP_INVOICE_6 } from './deep/invoice6.js';

/* 深度版案例覆盖：按「分类+序号」替换标准版 */
DEEP_WEEKLY.forEach((c, i) => { if (ALL['office:写工作周报'][i]) ALL['office:写工作周报'][i] = c; });
DEEP_WEEKLY_2.forEach((c, i) => { if (ALL['office:写工作周报'][i + 10]) ALL['office:写工作周报'][i + 10] = c; });
DEEP_WEEKLY_3.forEach((c, i) => { if (ALL['office:写工作周报'][i + 20]) ALL['office:写工作周报'][i + 20] = c; });
DEEP_MINUTES_1.forEach((c, i) => { if (ALL['office:会议纪要整理'][i]) ALL['office:会议纪要整理'][i] = c; });
DEEP_MINUTES_2.forEach((c, i) => { if (ALL['office:会议纪要整理'][i + 10]) ALL['office:会议纪要整理'][i + 10] = c; });
DEEP_MINUTES_3.forEach((c, i) => { if (ALL['office:会议纪要整理'][i + 20]) ALL['office:会议纪要整理'][i + 20] = c; });
DEEP_EMAIL_1.forEach((c, j) => { const idx = j + 0; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_EMAIL_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_EMAIL_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_EMAIL_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_EMAIL_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_EMAIL_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:邮件草拟'][idx]) ALL['office:邮件草拟'][idx] = c; });
DEEP_FILES_1.forEach((c, j) => { const idx = j + 0; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_FILES_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_FILES_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_FILES_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_FILES_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_FILES_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:文件整理'][idx]) ALL['office:文件整理'][idx] = c; });
DEEP_INVOICE_1.forEach((c, j) => { const idx = j + 0; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_INVOICE_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_INVOICE_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_INVOICE_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_INVOICE_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_INVOICE_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:发票报销整理'][idx]) ALL['office:发票报销整理'][idx] = c; });
DEEP_CONTRACT_1.forEach((c, j) => { const idx = j; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_CONTRACT_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_CONTRACT_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_CONTRACT_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_CONTRACT_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_CONTRACT_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:合同要点审查'][idx]) ALL['office:合同要点审查'][idx] = c; });
DEEP_NOTICE_1.forEach((c, j) => { const idx = j + 0; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_NOTICE_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_NOTICE_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_NOTICE_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_NOTICE_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_NOTICE_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:通知/公告拟稿'][idx]) ALL['office:通知/公告拟稿'][idx] = c; });
DEEP_SCHEDULE_1.forEach((c, j) => { const idx = j + 0; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_SCHEDULE_2.forEach((c, j) => { const idx = j + 5; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_SCHEDULE_3.forEach((c, j) => { const idx = j + 10; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_SCHEDULE_4.forEach((c, j) => { const idx = j + 15; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_SCHEDULE_5.forEach((c, j) => { const idx = j + 20; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_SCHEDULE_6.forEach((c, j) => { const idx = j + 25; if (ALL['office:日程安排'][idx]) ALL['office:日程安排'][idx] = c; });
DEEP_REVIEW_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_REVIEW_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_REVIEW_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_REVIEW_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_REVIEW_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_REVIEW_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:代码审查'][idx]) ALL['code:代码审查'][idx] = c; });
DEEP_BUG_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_BUG_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_BUG_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_BUG_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_BUG_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_BUG_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:Bug 诊断'][idx]) ALL['code:Bug 诊断'][idx] = c; });
DEEP_UTEST_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_UTEST_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_UTEST_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_UTEST_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_UTEST_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_UTEST_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:写单元测试'][idx]) ALL['code:写单元测试'][idx] = c; });
DEEP_README_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_README_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_README_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_README_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_README_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_README_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:生成 README'][idx]) ALL['code:生成 README'][idx] = c; });
DEEP_SCRIPT_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SCRIPT_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SCRIPT_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SCRIPT_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SCRIPT_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SCRIPT_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:脚本自动化'][idx]) ALL['code:脚本自动化'][idx] = c; });
DEEP_SQL_1.forEach((c, j) => { const idx = j + 0; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });
DEEP_SQL_2.forEach((c, j) => { const idx = j + 5; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });
DEEP_SQL_3.forEach((c, j) => { const idx = j + 10; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });
DEEP_SQL_4.forEach((c, j) => { const idx = j + 15; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });
DEEP_SQL_5.forEach((c, j) => { const idx = j + 20; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });
DEEP_SQL_6.forEach((c, j) => { const idx = j + 25; if (ALL['code:SQL 写与优化'][idx]) ALL['code:SQL 写与优化'][idx] = c; });









export default ALL;
export const TOTAL_CASES = Object.values(ALL).reduce((n, a) => n + a.length, 0);
