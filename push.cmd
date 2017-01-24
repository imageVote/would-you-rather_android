
REM git submodule foreach --recursive git merge --abort
git submodule foreach --recursive git reset --hard

git submodule foreach --recursive git add .
git submodule foreach --recursive git commit -m ".cmd"

git submodule foreach --recursive git pull
git submodule foreach --recursive git push

git add .
git commit -m ".cmd"
git pull
git push

pause
