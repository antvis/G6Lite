#!/bin/bash
# fix_openspec.sh
# 功能: 从 git 缓存移除 openspec 目录但保留本地文件，并确保 .gitignore 正确配置

set -e  # 遇到错误立即退出

cd "$(dirname "$0")"

echo "=========================================="
echo "G6Lite openspec 目录分离脚本"
echo "=========================================="
echo ""

# 检查当前目录
echo "[1/5] 确认工作目录..."
if [ ! -d "openspec" ]; then
    echo "❌ 错误: 当前目录不存在 openspec/ 目录"
    exit 1
fi
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是 git 仓库"
    exit 1
fi
echo "✅ 工作目录确认: $(pwd)"
echo ""

# 备份当前的 .gitignore
echo "[2/5] 备份 .gitignore..."
cp .gitignore .gitignore.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ 已备份到 .gitignore.backup.xxx"
echo ""

# 确保 openspec/ 在 .gitignore 中
echo "[3/5] 更新 .gitignore..."
if grep -q "^openspec/\$" .gitignore; then
    echo "✅ openspec/ 已在 .gitignore 中"
else
    echo "" >> .gitignore
    echo "openspec/" >> .gitignore
    echo "✅ 已将 openspec/ 添加到 .gitignore"
fi

# 移除旧的 openspec/nginx.conf 行（如果存在且冗余）
sed -i '' '/^openspec\/nginx\.conf$/d' .gitignore 2>/dev/null || true
echo "✅ 已清理冗余的 openspec/nginx.conf 行"
echo ""

# 从 git 缓存移除 openspec
echo "[4/5] 从 git 缓存移除 openspec/..."
echo "说明: 这会从 git 索引中移除 openspec/，但保留本地文件"
echo ""

if git rm -r --cached openspec/ 2>/dev/null; then
    echo "✅ 成功从 git 缓存移除 openspec/"
else
    echo "⚠️  git rm 遇到问题，尝试其他方式..."
    # 备选: 直接编辑 git index
    git ls-files | grep "^openspec/" | while read file; do
        git rm --cached "$file" 2>/dev/null || true
    done
    echo "✅ 已逐文件移除"
fi
echo ""

# 验证本地文件仍然存在
echo "[5/5] 验证本地文件..."
if [ -d "openspec" ] && [ -f "openspec/README.md" ]; then
    echo "✅ openspec/ 本地目录和文件仍然保留"
    echo "    目录大小: $(du -sh openspec/ 2>/dev/null | cut -f1)"
    echo "    文件数量: $(find openspec/ -type f 2>/dev/null | wc -l)"
else
    echo "❌ 警告: openspec/ 本地目录可能已被删除"
fi
echo ""

# 显示 git 状态
echo "=========================================="
echo "Git 状态摘要"
echo "=========================================="
git add .gitignore
git status --short | head -30
echo ""

# 完成提示
echo "=========================================="
echo "✅ 脚本执行完成"
echo "=========================================="
echo ""
echo "下一步操作:"
echo "1. 检查上面的 'Git 状态摘要' 是否正确"
echo "2. 如果看到 openspec/ 相关文件被标记为 'D' (deleted from index)，说明成功"
echo "3. 本地文件仍保留，但不会再被 git 跟踪"
echo "4. 提交更改:"
echo ""
echo "   git add .gitignore"
echo "   git commit -m 'chore: exclude openspec from git tracking'"
echo ""
echo "⚠️  由于权限限制，你可能需要手动执行提交命令"
echo ""
echo "备份文件: .gitignore.backup.xxx (执行成功后可删除)"
echo ""
