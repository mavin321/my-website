@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"

if exist "%VSWHERE%" (
  for /f "usebackq delims=" %%i in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VSINSTALL=%%i"
)

if defined VSINSTALL (
  if exist "%VSINSTALL%\VC\Auxiliary\Build\vcvars64.bat" (
    call "%VSINSTALL%\VC\Auxiliary\Build\vcvars64.bat"
  )
)

where cl >nul 2>nul
if errorlevel 1 (
  echo MSVC compiler not found. Install the Visual Studio C++ build tools and retry.
  exit /b 1
)

pushd "%SCRIPT_DIR%"
cl /nologo /std:c++17 /EHsc /O2 /LD /DATOMIC_ORBITAL_BUILD_DLL /Iinclude src\atomic_orbital_model.cpp /link /OUT:atomic_orbital.dll
set "BUILD_STATUS=%ERRORLEVEL%"
popd

exit /b %BUILD_STATUS%
