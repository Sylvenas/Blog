rm -rf ../sylvenas.github.io/*
cp -R public/* ../sylvenas.github.io

cd ../sylvenas.github.io

msg=$1
if [ -n "$msg" ]; then
   git add -A
   git commit -m"${msg}"
   git pull
   git status
   git push
   echo "sylvenas.github.io 发布完成"
else
    echo "请添加commit信息，再来一遍"
fi
