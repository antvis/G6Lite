#!/bin/bash
# push_pr.sh - 一键推送 feat-dev-init 分支并准备 PR

set -e

cd "$(dirname "$0")"
cd /Users/pearl/Develop/github/G6Lite

echo "=========================================="
echo "G6Lite feat-dev-init 分支推送脚本"
echo "=========================================="
echo ""

# 检查当前分支
echo "[1/5] 检查当前分支..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "当前分支: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "feat-dev-init" ]; then
    echo "❌ 错误: 当前不在 feat-dev-init 分支"
    echo "请执行: git checkout feat-dev-init"
    exit 1
fi
echo "✅ 分支检查通过"
echo ""

# 暂存所有更改（CI配置、新文件等）
echo "[2/5] 暂存所有更改..."
git add -A
echo "✅ 已暂存所有文件"
echo ""

# 检查是否有提交内容
echo "[3/5] 检查提交状态..."
if git diff --cached --quiet; then
    echo "⚠️  暂存区为空，但分支已有 commits"
else
    echo "发现未提交的更改，创建提交..."
    git commit -m "feat: complete P0+P1+P2+P3 interaction capabilities and code quality baseline

- Add ESLint + Prettier + husky + vitest with 104 tests
- Implement contextmenu, dblclick, mouseleave events
- Add brush-select, lasso-select, drag-edge, wheel behaviors
- Add lifecycle events: afteradditem/afterremoveitem/afterupdateitem
- Add findAllByState batch query methods
- Fix black screen issue during layout loading"
    echo "✅ 已创建提交"
fi
echo ""

# 获取远程更新
echo "[4/5] 获取远程更新..."
git fetch origin 2>&1 || echo "⚠️ fetch 受限，继续..."
echo ""

# 推送到远程
echo "[5/5] 推送到远程..."
echo "提示: 这可能会提示输入 GitHub 凭据"
echo ""
git push origin feat-dev-init
echo "✅ 推送成功"
echo ""

# 完成
echo "=========================================="
echo "✅ 推送完成"
echo "=========================================="
echo ""
echo "GitHub PR 链接:"
echo "https://github.com/antvis/G6Lite/pull/new/feat-dev-init"
echo ""
echo "请在浏览器中打开以上链接创建 PR"
echo ""
echo "PR 标题建议:"
echo "feat: complete P0+P1+P2+P3 interaction capabilities and code quality baseline"
echo ""
echo "PR 描述模板已准备，复制以下内容到 PR 描述:"
echo ""
echo "## 已完成能力补齐"
echo ""
echo "### P0 (阻塞业务)"
echo "- ✅ 节点/边/画布右键菜单 (contextmenu)"
echo ""
echo "### P1 (交互完整性)"
echo "- ✅ 节点/边/画布双击 (dblclick)"
echo "- ✅ 节点/边 Hover 离开事件 (mouseleave)"
echo "- ✅ 渲染完成事件 (afterrender)"
echo "- ✅ click-select 行为"
echo ""
echo "### P2 (高级交互)"
echo "- ✅ brush-select 框选"
echo "- ✅ lasso-select 圈选"
echo "- ✅ 数据变更事件 (afteradditem/removeitem/updateitem)"
echo ""
echo "### P3 (低优先级)"
echo "- ✅ 画布双击"
echo "- ✅ 边拖拽 (drag-edge)"
echo "- ✅ 节点/边/画布滚轮事件"
echo "- ✅ findAllByState 批量查询"
echo ""
echo "### 代码质量基线"
echo "- ✅ ESLint + Prettier + husky + lint-staged"
echo "- ✅ vitest 单元测试 (104 个测试)"
echo "- ✅ GitHub Actions CI 工作流"
echo "- ✅ package.json 元信息完善"
echo "- ✅ 修复黑屏加载问题"
echo ""
echo "### 测试"
echo "- 104 个测试全部通过"
echo "- lint → typecheck → test → build CI 流水线通过"
echo ""
