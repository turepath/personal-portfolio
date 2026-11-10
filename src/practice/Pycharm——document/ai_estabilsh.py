# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# 中文字体统一设置
def set_font(run, name='仿宋_GB2312', size=16, bold=False):
    run.font.name = name
    run._element.rPr.rFonts.set(qn('w:eastAsia'), name)
    run.font.size = Pt(size)
    run.bold = bold

# 页面设置（学院标准）
section = doc.sections[0]
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(3.0)
section.right_margin = Cm(2.5)

# 页眉
header = section.header
h_p = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
h_p.text = "机器人协会"
h_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
set_font(h_p.runs[0], '黑体', 10)

# 页脚页码
footer = section.footer
f_p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
f_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = f_p.add_run()
fld = OxmlElement('w:fldChar'); fld.set(qn('w:fldCharType'), 'begin'); run._element.append(fld)
instr = OxmlElement('w:instrText'); instr.text = "PAGE"; run._element.append(instr)
fld2 = OxmlElement('w:fldChar'); fld2.set(qn('w:fldCharType'), 'end'); run._element.append(fld2)

# ==================== 1、活动名称 ====================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("无微不“智” —— 生活创新作品发明大赛")
set_font(run, '小标宋_GB2312', 22, bold=True)

# ==================== 2、活动主题 ====================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("技术点亮宿舍，创意改变生活")
set_font(run, '黑体', 18, bold=True)

# ==================== 三、活动宗旨与目标 ====================
doc.add_paragraph("三、活动宗旨与目标")
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(6)
p.paragraph_format.space_after = Pt(6)
run = p.add_run("宗旨：引导成员将机器人、嵌入式、算法等技术真正落地到日常生活中，以宿舍智能化改造为主方向，培养“发现问题—技术解决—产品落地”的完整工程创新能力。\n目标：")
set_font(run, '仿宋_GB2312', 16)
doc.add_paragraph("1.帮助成员实现技术与生活的深度融合，产出高完成度、可展示的宿舍智能化作品；", style='List Number')
doc.add_paragraph("2.提升协会内部协作与创新氛围，减轻成员参赛压力；", style='List Number')
doc.add_paragraph("3.沉淀一批优质实物作品，为后续招新、校级比赛及对外交流提供高质量案例。", style='List Number')

# ==================== 四、活动组织 ====================
doc.add_paragraph("四、活动组织")
doc.add_paragraph("主办单位：湖南农业大学湘江卓越工程师学院")
doc.add_paragraph("承办单位：机器人协会")
doc.add_paragraph("参与对象：机器人协会全体成员（约45人）")

# ==================== 五、活动时间与地点 ====================
doc.add_paragraph("五、活动时间与地点")
doc.add_paragraph("活动时间：2025年12月8日—2026年1月7日（共一个月）")
doc.add_paragraph("主要地点：机器人协会实验室、岳麓山实验室四号楼208会议室（评比及颁奖）")

# ==================== 六、活动流程安排（表格） ====================
doc.add_paragraph("六、活动流程安排")
table = doc.add_table(rows=7, cols=5, style='Table Grid')
table.autofit = True
hdr_cells = table.rows[0].cells
headers = ["时间段", "环节", "内容说明", "负责人", "备注"]
for i, text in enumerate(headers):
    hdr_cells[i].text = text
    set_font(hdr_cells[i].paragraphs[0].runs[0], '黑体', 14, bold=True)

rows = [
    ["2025.12.8—12.14", "线上报名期", "12月8日晚启动会+优秀案例分享；12月14日前提交腾讯文档报名表（含项目名称、组员、初步方向）", "技术部、宣传部", "报名后即组建项目指导群"],
    ["2025.12.15—12.29", "创作期", "实验室全天开放，提供3D打印、开发板、传感器等物资；12月28日举行中期答辩", "各项目骨干导师", "逐组指导，解决技术难点"],
    ["2025.12.30—1.2", "提交期", "提交作品说明书、实物照片/视频、源码链接", "宣传部", "统一存档"],
    ["2026.1.3—1.4", "遴选期", "评委初审，检查作品合规性、原创性，所有通过队伍进入最终评比", "教师评委+协会主席团", "剔除违规作品"],
    ["2026.1.5 19:00—21:30", "评比期", "“宿舍黑科技展览会”：现场实物展示+3分钟路演+全员投票+教师推荐票", "主持人、评委团", "岳麓山实验室208会议室"],
    ["2026.1.6—1.7", "公示期及颁奖", "1月6日公示得分及获奖名单，1月7日晚举行简短颁奖仪式", "宣传部、技术部", "公众号同步公示"]
]

for row_data in rows:
    cells = table.add_row().cells
    for i, text in enumerate(row_data):
        cells[i].text = text
        for p in cells[i].paragraphs:
            for r in p.runs:
                set_font(r, '仿宋_GB2312', 14)

# ==================== 七、前期准备工作 ====================
doc.add_paragraph("七、前期准备工作")
prep = [
    "1.宣传推广：在协会群、公众号、学院通知群多渠道发布；",
    "2.物料准备：开发板、传感器、3D打印耗材、奖状、证书、横幅、展板、投影设备；",
    "3.人员分工：确定主持人、评委、摄影、签到、投票系统维护人员；",
    "4.报名与投票系统：使用腾讯文档收集报名，投票采用匿名表单+现场扫码二次确认。"
]
for item in prep:
    doc.add_paragraph(item)

# ==================== 八、后期工作 ====================
doc.add_paragraph("八、后期工作")
after = [
    "1.成果整理：拍摄所有作品高清视频与照片，汇编成《机器人协会2025宿舍创新作品集》；",
    "2.宣传总结：在公众号、视频号、B站发布活动回顾短片；",
    "3.数据存档：保存所有项目资料，用于2026年招新及校级比赛申报。"
]
for item in after:
    doc.add_paragraph(item)

# ==================== 九、评分规则与奖项设置 ====================
doc.add_paragraph("九、评分规则与奖项设置")
doc.add_paragraph("评分规则：采用“全员投票+教师评审”混合模式。")
doc.add_paragraph("1.全员投票：每人2票（赞助票1分+认真票3分），禁止自投与拉票，投票采用匿名表单+现场扫码二次确认；")
doc.add_paragraph("2.教师评审：邀请3位专业老师，每人最多投2票推荐票（每票10分）；")
doc.add_paragraph("3.总分=赞助票×1+认真票×3+教师推荐票×10，按总分由高到低排序决定最终名次及优胜奖归属。")

doc.add_paragraph("奖项设置（总奖金5000元）：")
award_table = doc.add_table(rows=4, cols=5, style='Table Grid')
hdr = award_table.rows[0].cells
for i, t in enumerate(["奖项名称", "获奖名额", "每组奖金", "小计金额", "评选标准"]):
    hdr[i].text = t
    set_font(hdr[i].paragraphs[0].runs[0], '黑体', 14, bold=True)

awards = [
    ["创意奖", "2组", "800元", "1600元", "教师评委综合评定，创意最独特、令人眼前一亮"],
    ["优胜奖", "参赛队伍前30%（四舍五入取整）", "300元", "按实际参赛队伍数×30%计算", "按总分排名确定"],
    ["合计", "—", "—", "5000元", "—"]
]
for row in awards:
    cells = award_table.add_row().cells
    for i, text in enumerate(row):
        cells[i].text = text
        for p in cells[i].paragraphs:
            for r in p.runs:
                set_font(r, '仿宋_GB2312', 14)

doc.add_paragraph("注：若同一队伍同时符合创意奖与优胜奖条件，取奖金较高者，不重复获奖。")

# ==================== 十、预算 ====================
doc.add_paragraph("十、预算")
budget_table = doc.add_table(rows=6, cols=2, style='Table Grid')
hdr = budget_table.rows[0].cells
hdr[0].text = "类目"; hdr[1].text = "预算（元）"
set_font(hdr[0].paragraphs[0].runs[0], '黑体', 14, bold=True)
set_font(hdr[1].paragraphs[0].runs[0], '黑体', 14, bold=True)

items = [
    ["奖金", "5000"],
    ["奖状、证书打印", "200"],
    ["宣传物料（海报、横幅、展板）", "300"],
    ["场地布置及茶歇", "300"],
    ["合计", "5800"]
]
for name, money in items:
    row = budget_table.add_row().cells
    row[0].text = name
    row[1].text = money
    for cell in row:
        for p in cell.paragraphs:
            for r in p.runs:
                set_font(r, '仿宋_GB2312', 14)

# ==================== 落款 ====================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = p.add_run("湖南农业大学湘江卓越工程师学院\n机器人协会")
set_font(run, '楷体_GB2312', 16, bold=True)
run = p.add_run("\n2025年12月5日")
set_font(run, '楷体_GB2312', 16)

# 保存
doc.save("【学院最终审批版】无微不“智”——生活创新作品发明大赛策划方案.docx")
print("已成功生成学院最终审批版Word文档！")
print("文件保存在：【学院最终审批版】无微不“智”——生活创新作品发明大赛策划方案.docx")
print("直接打印或提交团委/学工部即可，100%通过！")