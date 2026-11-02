# DOP Workspace - One-Click Startup and Automation Script
[CmdletBinding()]
param()

$Host.UI.RawUI.WindowTitle = "DOP Workspace - System Runner"

$scriptsDir = $PSScriptRoot
$parentDir = (Resolve-Path (Join-Path $scriptsDir "..")).Path

if (Test-Path (Join-Path $parentDir "package.json")) {
    $projectDir = $parentDir
    $workspaceDir = (Resolve-Path (Join-Path $projectDir "..\..")).Path
    $rootDir = $workspaceDir
} else {
    $workspaceDir = $parentDir
    $rootDir = $parentDir
    $projectDir = Join-Path $rootDir "project-bolt-sb1-mjzmxyfn\project"
}

$excelPath = Join-Path $projectDir "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx"
if (-not (Test-Path $excelPath)) {
    $excelPath = Join-Path $rootDir "DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx"
}

$iconPath = Join-Path $projectDir "app_icon.ico"
if (-not (Test-Path $iconPath)) {
    $iconPath = Join-Path $rootDir "app_icon.ico"
}

Write-Host ""
Write-Host " =====================================================================" -ForegroundColor Cyan
Write-Host "                  DOP WORKSPACE LAUNCHER" -ForegroundColor Cyan
Write-Host " =====================================================================" -ForegroundColor Cyan
Write-Host ""

# -------------------------------------------------------------
# 1. Update / Create Shortcuts with Icon
# -------------------------------------------------------------
try {
    $wsh = New-Object -ComObject WScript.Shell
    $batPath = Join-Path $projectDir "START_PROJECT.bat"
    if (-not (Test-Path $batPath)) {
        $batPath = Join-Path $rootDir "START_PROJECT.bat"
    }
    
    # In-folder shortcut (inside project)
    $folderShortcutPath = Join-Path $projectDir "Start DOP Workspace.lnk"
    $sc1 = $wsh.CreateShortcut($folderShortcutPath)
    $sc1.TargetPath = $batPath
    $sc1.WorkingDirectory = $projectDir
    if (Test-Path $iconPath) {
        $sc1.IconLocation = "$iconPath,0"
    }
    $sc1.Description = "Launch DOP Workspace and Antigravity IDE"
    $sc1.Save()

    # Workspace root shortcut if different
    if ($rootDir -and (Test-Path $rootDir) -and ($rootDir -ne $projectDir)) {
        $rootBat = Join-Path $rootDir "START_PROJECT.bat"
        $rootShortcutPath = Join-Path $rootDir "Start DOP Workspace.lnk"
        $scRoot = $wsh.CreateShortcut($rootShortcutPath)
        $scRoot.TargetPath = if (Test-Path $rootBat) { $rootBat } else { $batPath }
        $scRoot.WorkingDirectory = $rootDir
        if (Test-Path $iconPath) {
            $scRoot.IconLocation = "$iconPath,0"
        }
        $scRoot.Description = "Launch DOP Workspace"
        $scRoot.Save()
    }

    # Desktop shortcut for convenience
    $desktopPath = [System.Environment]::GetFolderPath('Desktop')
    if (Test-Path $desktopPath) {
        $desktopShortcutPath = Join-Path $desktopPath "DOP Workspace.lnk"
        $sc2 = $wsh.CreateShortcut($desktopShortcutPath)
        $sc2.TargetPath = $batPath
        $sc2.WorkingDirectory = $projectDir
        if (Test-Path $iconPath) {
            $sc2.IconLocation = "$iconPath,0"
        }
        $sc2.Description = "Launch DOP Workspace and Antigravity IDE"
        $sc2.Save()
    }
} catch {
    # Non-fatal if shortcut creation fails
}

# -------------------------------------------------------------
# 2. Launch Antigravity IDE with workspace folder
# -------------------------------------------------------------
Write-Host " [*] Checking for Antigravity IDE..." -ForegroundColor Yellow
$possibleIdePaths = @(
    "$env:LOCALAPPDATA\Programs\Antigravity IDE\Antigravity IDE.exe",
    "$env:ProgramFiles\Antigravity IDE\Antigravity IDE.exe",
    "${env:ProgramFiles(x86)}\Antigravity IDE\Antigravity IDE.exe"
)

$ideExe = $null
foreach ($path in $possibleIdePaths) {
    if (Test-Path $path) {
        $ideExe = $path
        break
    }
}

if (-not $ideExe) {
    $cmd = Get-Command agy, antigravity -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) {
        $ideExe = $cmd.Source
    }
}

if ($ideExe) {
    Write-Host " [+] Launching Antigravity IDE with project folder..." -ForegroundColor Green
    try {
        Start-Process -FilePath $ideExe -ArgumentList "`"$rootDir`""
    } catch {
        Write-Host " [-] Could not launch Antigravity IDE automatically." -ForegroundColor DarkYellow
    }
} else {
    Write-Host " [!] Antigravity IDE not detected in default paths." -ForegroundColor DarkYellow
    Write-Host "     If installed in a custom location, please open this folder manually." -ForegroundColor Gray
}

# -------------------------------------------------------------
# 3. Environment Verification (Node.js & Python)
# -------------------------------------------------------------
Write-Host " [*] Checking environment prerequisites..." -ForegroundColor Yellow

# Node.js
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host ""
    Write-Host " =====================================================================" -ForegroundColor Red
    Write-Host " [ERROR] Node.js was not found on this computer." -ForegroundColor Red
    Write-Host " Node.js is required to run the DOP Workspace application." -ForegroundColor Red
    Write-Host " Please download and install the LTS version from: https://nodejs.org/" -ForegroundColor White
    Write-Host " =====================================================================" -ForegroundColor Red
    Write-Host ""
    $ans = Read-Host "Would you like to open the Node.js download page now? (Y/N)"
    if ($ans -eq 'Y' -or $ans -eq 'y') {
        Start-Process "https://nodejs.org/"
    }
    exit 1
}

# Python & openpyxl
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    # Check openpyxl
    & python -c "import openpyxl" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [*] Installing required Excel library (openpyxl)..." -ForegroundColor Cyan
        & pip install openpyxl
    }
} else {
    Write-Host " [!] Python was not detected in PATH. App will run in offline mode." -ForegroundColor DarkYellow
}

# Node dependencies
$nodeModulesDir = Join-Path $projectDir "node_modules"
if (-not (Test-Path $nodeModulesDir)) {
    Write-Host " [*] First-time setup: installing web application packages..." -ForegroundColor Cyan
    Push-Location $projectDir
    & npm install
    Pop-Location
}

# -------------------------------------------------------------
# 4. Background Browser Opener
# -------------------------------------------------------------
# Spins off a background job that polls until the dev server is ready on http://localhost:5173
Start-Job -ScriptBlock {
    $targetUrl = 'http://localhost:5173'
    $opened = $false
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Milliseconds 600
        try {
            $resp = Invoke-WebRequest -Uri $targetUrl -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -eq 200) {
                $opened = $true
                break
            }
        } catch {}
    }
    # Open default browser
    Start-Process $targetUrl
} | Out-Null

# -------------------------------------------------------------
# 5. Set Environment & Start Application Server
# -------------------------------------------------------------
$env:EXCEL_PATH = $excelPath

Write-Host ""
Write-Host " =====================================================================" -ForegroundColor Green
Write-Host "                  DOP WORKSPACE IS NOW RUNNING!" -ForegroundColor Green
Write-Host " =====================================================================" -ForegroundColor Green
Write-Host "  * Antigravity IDE : Opened with folder" -ForegroundColor White
Write-Host "  * Web Application : http://localhost:5173 (Opening in browser)" -ForegroundColor White
Write-Host "  * Master Database : $excelPath" -ForegroundColor White
Write-Host " =====================================================================" -ForegroundColor Green
Write-Host "  [!] Please KEEP THIS WINDOW OPEN while using the application." -ForegroundColor Yellow
Write-Host "  [!] To stop the application when you are done, simply close this window." -ForegroundColor Gray
Write-Host " =====================================================================" -ForegroundColor Green
Write-Host ""

Set-Location $projectDir
& npm run dev
