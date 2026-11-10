import time
import subprocess
import pyautogui


def add_pinyin_to_word():
    """模拟人类操作，在Word中为指定文字添加拼音"""

    # 配置参数（根据实际情况修改）
    word_path = r"C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE"
    doc_path = r"C:\Users\YourName\Desktop\test.docx"  # 要编辑的文档路径
    target_text = "农业大学"  # 要加拼音的文字

    print("🚀 正在启动Word...")
    subprocess.Popen([word_path, doc_path])

    # 等待Word完全启动（根据电脑性能调整）
    time.sleep(3)

    try:
        print("🔍 正在定位文档...")
        # 确保Word窗口在最前
        pyautogui.hotkey('alt', 'tab')  # 切换到Word窗口
        time.sleep(1)

        print("⌨️ 正在查找文字...")
        # Ctrl+F 打开查找框
        pyautogui.hotkey('ctrl', 'f')
        time.sleep(0.5)

        # 输入要查找的文字（会自动选中）
        pyautogui.write(target_text, interval=0.05)
        time.sleep(0.5)

        # 关闭查找框（按ESC）
        pyautogui.press('esc')
        time.sleep(0.2)

        print("📌 正在添加拼音...")
        # 打开拼音指南对话框 (Alt+R+G)
        # 注意：不同Word版本快捷键可能不同
        pyautogui.hotkey('alt', 'r', 'g')
        time.sleep(1)

        # 在拼音指南对话框中按Enter确认
        pyautogui.press('enter')
        time.sleep(0.5)

        print("💾 正在保存...")
        # Ctrl+S 保存
        pyautogui.hotkey('ctrl', 's')
        time.sleep(0.5)

        print("✅ 操作完成！")

    except Exception as e:
        print(f"❌ 操作失败: {e}")
    finally:
        # Alt+F4 关闭Word
        print("🚪 正在关闭Word...")
        pyautogui.hotkey('alt', 'f4')
        time.sleep(0.5)
        # 不保存提示（如果已经保存过可能会弹出）
        pyautogui.press('n')


if __name__ == "__main__":
    # 安全提示：运行前确保没有其他重要操作
    print("⚠️  警告：此脚本将模拟键盘鼠标操作，")
    print("    运行前请确保Word已关闭，且没有其他重要任务！")
    input("按Enter键继续...")

    # 设置pyautogui安全参数
    pyautogui.FAILSAFE = True  # 将鼠标拖到左上角可强制停止
    pyautogui.PAUSE = 0.2  # 每次操作后暂停0.2秒

    add_pinyin_to_word()