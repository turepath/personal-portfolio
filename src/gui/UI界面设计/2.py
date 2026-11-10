import sys
from PyQt5.QtWidgets import QApplication, QWidget, QHBoxLayout, QVBoxLayout, QPushButton, QLabel

class MainWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.counter = 0
        self.initUI()

    def initUI(self):
        # 创建水平布局
        hbox = QHBoxLayout()

        # 创建按钮
        button1 = QPushButton('+1', self)
        button1.clicked.connect(self.add_one)
        hbox.addWidget(button1)

        button2 = QPushButton('+2', self)
        button2.clicked.connect(self.add_two)
        hbox.addWidget(button2)

        button3 = QPushButton('其它', self)
        button3.clicked.connect(self.other_action)
        hbox.addWidget(button3)

        # 创建标签
        self.label = QLabel(f'当前计数: {self.counter}', self)

        # 创建垂直布局
        vbox = QVBoxLayout()
        vbox.addStretch(1)
        vbox.addLayout(hbox)
        vbox.addWidget(self.label)
        vbox.addStretch(1)

        self.setLayout(vbox)

        self.setGeometry(300, 300, 400, 300)
        self.setWindowTitle('简单 UI 界面')
        self.show()

    def add_one(self):
        self.counter += 1
        self.label.setText(f'当前计数: {self.counter}')

    def add_two(self):
        self.counter += 2
        self.label.setText(f'当前计数: {self.counter}')

    def other_action(self):
        self.label.setText('你点击了其它按钮')

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = MainWindow()
    sys.exit(app.exec_())