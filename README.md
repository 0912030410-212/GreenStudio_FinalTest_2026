# GreenExplore · 协作开发考核

这是一个供 15 名同学一起完成的本地开发项目。每人交付两项内容：一份验证通过的排序代码，以及自己的自我介绍页面。网页首页汇总所有成员的介绍，开发过程包括拉取项目、编码、验证、提交和审核。

**第一次使用 Git 和 VS Code：请从 [学生图形化操作指南](STUDENT_GUIDE.md) 开始。** 包含克隆、姓名邮箱配置、分支、菜单启动、提交和 PR 审核，无需手动输入终端命令。当前课程仓库为 [GreenStudio_FinalTest_2026](https://github.com/UnwrittenJuly/GreenStudio_FinalTest_2026)，公共分支为 `main`。

## 1. Windows：双击启动

1. 获取项目：下载 ZIP 并完整解压，或用 Git 拉取仓库。
2. 在 Windows 文件资源管理器中双击项目里的 **`start.bat`**；VS Code 中则选择 **终端 → 运行任务 → 启动项目（Windows）**。脚本自动检测 Python，缺少时首次联网准备；无需提前安装 Python、Node.js 或配置环境变量。
3. 等待浏览器自动打开 [http://127.0.0.1:8000](http://127.0.0.1:8000)。使用期间保持启动窗口打开，关闭窗口即可结束服务。

排序默认选择 Python，即可完成全部考核。C / C++ 是可选语言，需要自行准备 GCC / G++。修改介绍页可以使用 VS Code，也可以用系统记事本打开自己的 HTML 文件，保存为 UTF-8。

**正式参与仓库协作还需安装 Git，并按第 4 节拉取项目、创建个人分支后再开始修改。** 下载 ZIP 可以直接体验运行，但 ZIP 目录不包含 Git 提交记录。

离线机房可由老师在联网且 Windows 架构相同的电脑运行 `.\start.bat -Portable -PrepareOnly`，准备好 `.runtime/` 后，将包含该文件夹的完整项目压缩分发。同学解压后仍双击 `start.bat`；`.runtime/` 不提交到 Git。便携运行环境来自 [Python 官方发布包](https://www.python.org/downloads/release/python-31317/)，下载后校验 SHA-256，不修改系统 PATH，不需要管理员权限。

macOS / Linux 或已安装 Python 3.10+ 的电脑，可在项目目录运行 `python server.py`。需要更换端口时运行 `python server.py --port 8080`。

## 2. 第一部分：排序代码

1. 进入网页的排序部分，选择自己的成员身份，页面自动填入班级姓名；选择 Python、C 或 C++。
2. 在网页编辑器中完成 `sort_array`，将数组升序排列，保留重复元素并支持负数。
3. 点击运行并验证。当前测试数组验证通过后可以下载；可更换数组进一步验证。
4. 下载文件名为 `班级_姓名` 加语言扩展名，例如 `电子2602_任天灵.py`。将文件手动移动到仓库的 `submissions/` 文件夹。

| 语言 | 入口函数 | 记录排序过程 | 扩展名 |
| --- | --- | --- | --- |
| Python | `def sort_array(arr)` | `snapshot(arr)` | `.py` |
| C | `void sort_array(int arr[], int n)` | `snapshot(arr, n)` | `.c` |
| C++ | `void sort_array(vector<int>& arr)` | `snapshot(arr)` | `.cpp` |

Python 可以返回排序后的列表，也可以原地修改数组；C / C++ 原地修改数组。无需编写 `main` 或读取输入。交换或写入后调用 `snapshot`，网页就会播放代码产生的数组变化。编辑代码或切换语言后，需要重新验证才能下载。

每人选择一种语言提交即可。浏览器草稿和下载不会自动写入仓库。详见 [排序代码提交说明](submissions/README.md)。

## 3. 第二部分：成员介绍

查看 [15 人分工表](members/README.md)，找到自己的 `members/01.html` 到 `members/15.html`。每人只修改对应的一个 HTML 文件：结构、样式和自我介绍都写在这个文件里。保存并刷新浏览器，在首页查看效果。

介绍建议包含姓名、班级、一句话介绍、兴趣或技能，以及一个学习目标。可以调整自己页面的颜色和排版，做到简洁易读。保留文件路径和分工对应关系。例如任天灵负责 `members/01.html`，李嘉赢负责 `members/02.html`，完整名单以分工表为准。

## 4. Git 协作与审核

开始开发前安装 Git。以下已填入课程仓库地址，以电子 2602 班任天灵为例，其他同学替换自己的班级姓名；图形化操作见上方学生指南：

```sh
git clone https://github.com/UnwrittenJuly/GreenStudio_FinalTest_2026.git
cd GreenStudio_FinalTest_2026
git switch -c student/电子2602-任天灵
```

在这个目录双击 `start.bat` 完成两部分。提交前，确认排序通过网页验证，首页正常展示自己的介绍，窄屏下也能阅读：

```sh
git status
git diff -- members/01.html
git add members/01.html submissions/电子2602_任天灵.py
git commit -m "feat: 完成任天灵的介绍与排序考核"
git push -u origin student/电子2602-任天灵
```

在远程仓库创建 Pull Request（PR），目标分支选择 `main`，来源分支选择自己的 `student/...` 分支。填写班级姓名、介绍文件、排序语言和验证结果，等待审核。收到修改意见后，在自己的分支修改、重新验证、提交并推送，PR 会自动更新。审核通过后，由维护者合并到共享首页。

没有仓库写权限时，先 Fork 仓库，推送到自己的 Fork，再向原仓库的 `main` 分支发起 PR。继续开发前，可在个人分支运行 `git fetch origin` 和 `git merge origin/main` 同步已合并内容。

## 项目结构与维护

```text
GreenExplore/
├─ index.html             # 团队首页与考核入口
├─ app.js                 # 页面交互与成员展示
├─ sorting.js             # 排序编辑、验证与下载
├─ styles.css             # 公共样式
├─ members/
│  ├─ README.md           # 15 人分工表
│  └─ 01.html … 15.html   # 每位同学独立编辑的介绍
├─ submissions/           # 班级_姓名.py / .c / .cpp
├─ server.py              # 本地服务与代码执行
├─ start.bat              # Windows 双击启动入口
├─ start.ps1              # 自动准备 Python 并启动
├─ STUDENT_GUIDE.md       # VS Code 图形化操作指南
├─ .vscode/tasks.json     # 菜单启动任务
└─ test_server.py         # 执行服务测试
```

无需安装前端依赖。维护者可运行 `node --check app.js`、`node --check sorting.js` 和 `python -m unittest -v test_server.py` 检查代码。执行服务仅监听本机地址，提交程序以启动服务用户的权限运行，适用于可信代码的本地开发验证。
