@echo off
echo.
echo [��Ϣ] ��װWeb���̣�����node_modules�ļ���
echo.

%~d0
cd %~dp0

cd ..
yarn --registry=http://repo.sino-life.com/repository/npm-taobao

pause