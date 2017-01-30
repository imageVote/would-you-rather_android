CLONE: (and give apache control!)
```
git clone https://trollderiu@bitbucket.org/imageVote/would-you-rather_android.git would-you-rather_android
git clone https://trollderiu@bitbucket.org/imageVote/would-you-rather.git would-you-rather_android/app_free/src/main/assets
git clone https://trollderiu@bitbucket.org/imageVote/imagevote_public.git would-you-rather_android/app_free/src/main/assets/~commons
git clone https://trollderiu@bitbucket.org/imageVote/android.git would-you-rather_android/app_free/src/main/java/at/imagevote
chown -R www-data:www-data would-you-rather_android
```
PULL:
```
git pull
git --git-dir=would-you-rather_android/app_free/src/main/assets/.git pull
git --git-dir=would-you-rather_android/app_free/src/main/assets/~commons/.git pull
git --git-dir=would-you-rather_android/app_free/src/main/java/at/imagevote.git pull
```

CHECK OUT:
git submodule foreach --recursive git checkout master 
( git checkout master )

PULL:
git submodule foreach --recursive git pull origin master
( git pull )