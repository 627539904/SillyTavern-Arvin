@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo SillyTavern 第三方服务启动器 (测试版)
echo ========================================
echo.

echo [Debug] 脚本开始执行...
echo [Debug] 当前目录: %CD%
echo [Debug] 脚本路径: %~dp0
echo.

:: 设置第三方服务路径
set COMFYUI_PATH=F:\Document\Github\ComfyUI\ComfyUI-Arvin\start.bat
set COMFYUI_DIR=F:\Document\Github\ComfyUI\ComfyUI-Arvin
set GPT_SOVITS_PATH=F:\AI-Speech\GPT-SoVITS-beta\go-api.bat
set GPT_SOVITS_DIR=F:\AI-Speech\GPT-SoVITS-beta

echo [Debug] 检查路径是否存在...
echo [Debug] ComfyUI 启动文件: %COMFYUI_PATH%
if exist "%COMFYUI_PATH%" (
    echo [Debug] ✓ ComfyUI 启动文件存在
) else (
    echo [Debug] ✗ ComfyUI 启动文件不存在
)

echo [Debug] ComfyUI 目录: %COMFYUI_DIR%
if exist "%COMFYUI_DIR%" (
    echo [Debug] ✓ ComfyUI 目录存在
) else (
    echo [Debug] ✗ ComfyUI 目录不存在
)

echo [Debug] GPT-SoVITS 启动文件: %GPT_SOVITS_PATH%
if exist "%GPT_SOVITS_PATH%" (
    echo [Debug] ✓ GPT-SoVITS 启动文件存在
) else (
    echo [Debug] ✗ GPT-SoVITS 启动文件不存在
)

echo [Debug] GPT-SoVITS 目录: %GPT_SOVITS_DIR%
if exist "%GPT_SOVITS_DIR%" (
    echo [Debug] ✓ GPT-SoVITS 目录存在
) else (
    echo [Debug] ✗ GPT-SoVITS 目录不存在
)

echo.

:: 设置服务URL
set COMFYUI_URL=http://127.0.0.1:8188
set GPT_SOVITS_URL=http://127.0.0.1:9880

echo [Debug] 开始检查第三方服务状态...
echo.

:: 检查ComfyUI服务
echo [Debug] 检查 ComfyUI 服务 (端口 8188)...
echo [Debug] 尝试连接: %COMFYUI_URL%

:: 使用ping替代curl进行简单测试
ping -n 1 127.0.0.1 >nul 2>&1
if %errorlevel% equ 0 (
    echo [Debug] ✓ 本地网络连接正常
) else (
    echo [Debug] ✗ 本地网络连接异常
)

:: 尝试使用curl检查服务
echo [Debug] 尝试使用curl检查ComfyUI...
curl -s -o nul -w "%%{http_code}" "%COMFYUI_URL%" --connect-timeout 3 --max-time 5 > temp_comfyui.txt 2>nul
if exist temp_comfyui.txt (
    set /p COMFYUI_STATUS=<temp_comfyui.txt
    del temp_comfyui.txt
    echo [Debug] ComfyUI 状态码: %COMFYUI_STATUS%
) else (
    set COMFYUI_STATUS=000
    echo [Debug] ComfyUI 连接失败或curl不可用
)

if "%COMFYUI_STATUS%"=="200" (
    echo [Debug] ✓ ComfyUI 服务已运行
    set COMFYUI_RUNNING=true
) else (
    echo [Debug] ✗ ComfyUI 服务未运行
    set COMFYUI_RUNNING=false
)

echo.

:: 检查GPT-SoVITS服务
echo [Debug] 检查 GPT-SoVITS 服务 (端口 9880)...
echo [Debug] 尝试连接: %GPT_SOVITS_URL%

:: 尝试使用curl检查服务
echo [Debug] 尝试使用curl检查GPT-SoVITS...
curl -s -o nul -w "%%{http_code}" "%GPT_SOVITS_URL%" --connect-timeout 3 --max-time 5 > temp_gpt_sovits.txt 2>nul
if exist temp_gpt_sovits.txt (
    set /p GPT_SOVITS_STATUS=<temp_gpt_sovits.txt
    del temp_gpt_sovits.txt
    echo [Debug] GPT-SoVITS 状态码: %GPT_SOVITS_STATUS%
) else (
    set GPT_SOVITS_STATUS=000
    echo [Debug] GPT-SoVITS 连接失败或curl不可用
)

if "%GPT_SOVITS_STATUS%"=="200" (
    echo [Debug] ✓ GPT-SoVITS 服务已运行
    set GPT_SOVITS_RUNNING=true
) else (
    echo [Debug] ✗ GPT-SoVITS 服务未运行
    set GPT_SOVITS_RUNNING=false
)

echo.

:: 启动服务
if "%COMFYUI_RUNNING%"=="false" (
    echo [Debug] 尝试启动 ComfyUI...
    if exist "%COMFYUI_PATH%" (
        if exist "%COMFYUI_DIR%" (
            echo [Debug] 启动命令: start "ComfyUI" /d "%COMFYUI_DIR%" "%COMFYUI_PATH%"
            start "ComfyUI" /d "%COMFYUI_DIR%" "%COMFYUI_PATH%"
            echo [Debug] ✓ ComfyUI 启动命令已执行
        ) else (
            echo [Debug] ✗ ComfyUI 目录不存在
        )
    ) else (
        echo [Debug] ✗ ComfyUI 启动文件不存在
    )
)

if "%GPT_SOVITS_RUNNING%"=="false" (
    echo [Debug] 尝试启动 GPT-SoVITS...
    if exist "%GPT_SOVITS_PATH%" (
        if exist "%GPT_SOVITS_DIR%" (
            echo [Debug] 启动命令: start "GPT-SoVITS" /d "%GPT_SOVITS_DIR%" "%GPT_SOVITS_PATH%"
            start "GPT-SoVITS" /d "%GPT_SOVITS_DIR%" "%GPT_SOVITS_PATH%"
            echo [Debug] ✓ GPT-SoVITS 启动命令已执行
        ) else (
            echo [Debug] ✗ GPT-SoVITS 目录不存在
        )
    ) else (
        echo [Debug] ✗ GPT-SoVITS 启动文件不存在
    )
)

echo.
echo [Debug] 服务检查完成，等待3秒...
timeout /t 3 /nobreak >nul

:: 启动SillyTavern项目
echo [Debug] 开始启动 SillyTavern...
echo [Debug] 切换到项目目录: %~dp0
pushd %~dp0

echo [Debug] 设置环境变量: NODE_ENV=production
set NODE_ENV=production

echo [Debug] 检查npm是否可用...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] npm 不可用，请确保已安装 Node.js
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
) else (
    echo [Debug] ✓ npm 可用
)

echo [Debug] 检查node是否可用...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] node 不可用，请确保已安装 Node.js
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
) else (
    echo [Debug] ✓ node 可用
)

echo [Debug] 检查package.json是否存在...
if exist "package.json" (
    echo [Debug] ✓ package.json 存在
) else (
    echo [错误] package.json 不存在，请确保在正确的项目目录中
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
)

echo [Debug] 检查server.js是否存在...
if exist "server.js" (
    echo [Debug] ✓ server.js 存在
) else (
    echo [错误] server.js 不存在，请确保在正确的项目目录中
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
)

echo [Debug] 安装依赖包...
echo [Debug] 执行命令: npm install --no-audit --no-fund --loglevel=error --no-progress --omit=dev
call npm install --no-audit --no-fund --loglevel=error --no-progress --omit=dev
if %errorlevel% neq 0 (
    echo [错误] npm install 失败，错误代码: %errorlevel%
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
) else (
    echo [Debug] ✓ 依赖包安装成功
)

echo [Debug] 启动 SillyTavern 服务器...
echo [Debug] 执行命令: node server.js --listen %*
echo [Debug] 注意: 如果启动成功，SillyTavern将在浏览器中打开
echo [Debug] 如果出现错误，请查看下方的错误信息
echo.

node server.js --listen %*
set NODE_EXIT_CODE=%errorlevel%

if %NODE_EXIT_CODE% neq 0 (
    echo.
    echo [错误] SillyTavern 启动失败，错误代码: %NODE_EXIT_CODE%
    echo [Debug] 可能的原因:
    echo [Debug] 1. 端口被占用
    echo [Debug] 2. 依赖包安装不完整
    echo [Debug] 3. 配置文件错误
    echo [Debug] 4. 权限不足
    echo [Debug] 按任意键退出...
    pause
    exit /b 1
) else (
    echo [Debug] ✓ SillyTavern 启动成功
)

popd
echo [Debug] 脚本执行完成
endlocal 