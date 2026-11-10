from PIL import Image, ImageDraw, ImageFont
import calendar


def generate_school_calendar(output_path="school_calendar.png"):
    # 画布设置
    width, height = 1500, 850
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # 字体设置（优先使用黑体，找不到则回退默认）
    try:
        title_font = ImageFont.truetype("simhei.ttf", 26)
        text_font = ImageFont.truetype("simhei.ttf", 15)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # 1. 绘制标题
    title = "湖南农业大学2025一2026学年第一学期校历"
    subtitle = "2025年下半年（秋季学期）"
    draw.text((width // 2 - 250, 20), title, font=title_font, fill="black")
    draw.text((width // 2 - 120, 60), subtitle, font=text_font, fill="black")

    # 2. 基础布局参数
    start_x, start_y = 60, 120
    week_col_w = 70
    day_w, day_h = 75, 30

    # 3. 绘制月份标题（横向排列）
    months = ["9月", "10月", "11月", "12月", "1月", "2月"]
    for i, month in enumerate(months):
        x = start_x + week_col_w + i * (day_w * 7) + day_w * 3.5
        draw.text((x, start_y), month, font=text_font, fill="black", anchor="mm")

    # 4. 绘制星期标题（每月份独立）
    y = start_y + 30
    weekdays = ["日", "一", "二", "三", "四", "五", "六"]
    for month in range(6):
        month_x = start_x + week_col_w + month * (day_w * 7)
        for i, wd in enumerate(weekdays):
            x = month_x + i * day_w
            draw.rectangle([x, y, x + day_w, y + day_h], outline="black")
            draw.text((x + day_w // 2, y + 5), wd, font=text_font, fill="black", anchor="mm")

    # 5. 绘制日期网格
    y = start_y + 60
    month_configs = [(2025, 9), (2025, 10), (2025, 11), (2025, 12), (2026, 1), (2026, 2)]

    for month_idx, (year, month) in enumerate(month_configs):
        cal = calendar.monthcalendar(year, month)
        month_x = start_x + week_col_w + month_idx * (day_w * 7)

        # 仅在第一月份绘制周次
        if month_idx == 0:
            for week_idx in range(len(cal)):
                draw.text((start_x + week_col_w // 2, y + week_idx * day_h + 5),
                          f"第{week_idx + 1}周", font=text_font, fill="black", anchor="mm")

        # 绘制日期
        for week_idx, week in enumerate(cal):
            for day_idx, day in enumerate(week):
                x = month_x + day_idx * day_w
                draw.rectangle([x, y + week_idx * day_h, x + day_w, y + week_idx * day_h + day_h],
                               outline="black")
                if day != 0:
                    draw.text((x + day_w // 2, y + week_idx * day_h + 5), str(day),
                              font=text_font, fill="black", anchor="mm")

    # 6. 绘制底部说明
    notes = [
        "2025年8月30日-8月31日  老生报到",
        "2025年9月1日          老生上课",
        "2025年9月15日         新生报到",
        "2025年10月9日         新生上课",
        "2025年11月            校运动会",
        "2025年11月22日-23日   期中考试",
        "2026年1月12日-1月18日 期末考试",
        "2026年1月19日         寒假开始",
        "2026年2月17日         春节"
    ]

    y_notes = height - 180
    for note in notes:
        draw.text((start_x, y_notes), note, font=text_font, fill="black")
        y_notes += 22

    # 7. 添加月份分割线
    for i in range(1, 6):
        x = start_x + week_col_w + i * (day_w * 7)
        draw.line([x, start_y, x, height - 150], fill="black", width=2)

    # 保存图片
    img.save(output_path)
    print(f"✅ 校历已生成：{output_path}")


if __name__ == "__main__":
    generate_school_calendar()