#!/bin/bash

# 开启匹配隐藏文件（.开头的文件）
shopt -s dotglob

# 通用目录复制函数：参数1=源目录，参数2=目标目录
copy_directory() {
    local src_dir="$1"
    local dest_dir="$2"

    # 检查源目录是否存在
    if [ ! -d "$src_dir" ]; then
        echo "❌ 跳过：源目录不存在 -> $src_dir"
        return 1
    fi

    # 创建目标目录（不存在则自动创建，已存在则跳过）
    mkdir -p "$dest_dir"

    # 执行强制覆盖复制
    # -r 递归复制子目录
    # -f 强制覆盖，不提示
    # -v 显示复制详情，不需要可删掉
    cp -rfv "$src_dir"/* "$dest_dir"/

    echo "✅ 复制完成：$src_dir  ->  $dest_dir"
    return 0
}

# -------------------------- 目录映射配置 --------------------------
# 第一组：日记目录
DIARY_SRC="/home/jianyuelinux/documents/articals/diary"
DIARY_DEST="/home/jianyuelinux/documents/code/programs/cyber-diary-selfuse/diary"

# 第二组：资源目录
RESOURCES_SRC="/home/jianyuelinux/documents/articals/resources"
RESOURCES_DEST="/home/jianyuelinux/documents/code/programs/cyber-diary-selfuse/resources"
# ----------------------------------------------------------------

# 按顺序串行执行复制
copy_directory "$DIARY_SRC" "$DIARY_DEST"
copy_directory "$RESOURCES_SRC" "$RESOURCES_DEST"

# 关闭 dotglob 恢复默认
shopt -u dotglob

echo
echo "🎉 所有目录复制任务执行完毕！"