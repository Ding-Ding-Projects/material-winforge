param([switch]$Silent)

$ErrorActionPreference = 'Stop'
$Started = [DateTimeOffset]::UtcNow
$RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$Manifest = Get-Content -LiteralPath (Join-Path $RepoRoot 'toolchain-manifest.json') -Raw | ConvertFrom-Json
$ToolRoot = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'MaterialWinForge\toolchains'
$NodeHome = Join-Path $ToolRoot ("node-v{0}-{1}" -f $Manifest.node.version, $Manifest.node.platform)

function Write-Phase([string]$Message) {
  if (-not $Silent) { Write-Host ("[dependencies] {0}" -f $Message) }
}

function Get-Sha256([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  try {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
  } finally { $stream.Dispose() }
}

function Test-Node([string]$Executable) {
  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) { return $false }
  $version = (& $Executable --version 2>$null)
  return $LASTEXITCODE -eq 0 -and $version -eq ("v{0}" -f $Manifest.node.version)
}

function Remove-OwnedDirectory([string]$Path) {
  $resolvedRoot = [IO.Path]::GetFullPath($ToolRoot).TrimEnd('\') + '\'
  $resolvedPath = [IO.Path]::GetFullPath($Path)
  if (-not $resolvedPath.StartsWith($resolvedRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove a path outside the toolchain directory: $resolvedPath"
  }
  if (Test-Path -LiteralPath $resolvedPath) { Remove-Item -LiteralPath $resolvedPath -Recurse -Force }
}

$CurrentNode = Get-Command node.exe -ErrorAction SilentlyContinue
if ($CurrentNode -and (Test-Node $CurrentNode.Source)) {
  $NodeExecutable = $CurrentNode.Source
  $NodeHome = Split-Path -Parent $NodeExecutable
  Write-Phase ("Found Node.js {0} at {1}." -f $Manifest.node.version, $NodeHome)
} else {
  New-Item -ItemType Directory -Path $ToolRoot -Force | Out-Null
  $NodeExecutable = Join-Path $NodeHome 'node.exe'
  if (-not (Test-Node $NodeExecutable)) {
    Write-Phase ("Downloading Node.js {0} from {1}." -f $Manifest.node.version, $Manifest.node.url)
    $Stage = Join-Path $ToolRoot ('.node-stage-' + [Guid]::NewGuid().ToString('N'))
    $Archive = Join-Path $ToolRoot ($Manifest.node.archive + '.download')
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $Manifest.node.url -OutFile $Archive
      $actual = Get-Sha256 $Archive
      if ($actual -ne [string]$Manifest.node.sha256) { throw "Node.js archive digest mismatch. Expected $($Manifest.node.sha256); received $actual." }
      New-Item -ItemType Directory -Path $Stage -Force | Out-Null
      Expand-Archive -LiteralPath $Archive -DestinationPath $Stage -Force
      $Extracted = Join-Path $Stage ("node-v{0}-{1}" -f $Manifest.node.version, $Manifest.node.platform)
      if (-not (Test-Node (Join-Path $Extracted 'node.exe'))) { throw 'The extracted Node.js archive does not contain the expected executable.' }
      Remove-OwnedDirectory $NodeHome
      Move-Item -LiteralPath $Extracted -Destination $NodeHome
    } finally {
      if (Test-Path -LiteralPath $Archive) { Remove-Item -LiteralPath $Archive -Force }
      Remove-OwnedDirectory $Stage
    }
  }
  Write-Phase ("Using pinned portable Node.js at {0}." -f $NodeHome)
}

$env:PATH = $NodeHome + [IO.Path]::PathSeparator + $env:PATH
$Npm = Join-Path $NodeHome 'npm.cmd'
if (-not (Test-Path -LiteralPath $Npm -PathType Leaf)) { $Npm = (Get-Command npm.cmd -ErrorAction Stop).Source }

foreach ($Project in @('main-app-design', 'pages')) {
  $ProjectRoot = Join-Path $RepoRoot $Project
  $Lock = Join-Path $ProjectRoot 'package-lock.json'
  if (-not (Test-Path -LiteralPath $Lock -PathType Leaf)) {
    Write-Phase ("Skipping {0}; no package lock is present." -f $Project)
    continue
  }
  $Stamp = Join-Path $ProjectRoot 'node_modules\.material-winforge-lock.sha256'
  $LockHash = Get-Sha256 $Lock
  $Warm = (Test-Path -LiteralPath $Stamp -PathType Leaf) -and ((Get-Content -LiteralPath $Stamp -Raw).Trim() -eq $LockHash)
  if ($Warm) {
    Write-Phase ("Reusing verified npm dependencies for {0}." -f $Project)
    continue
  }
  Write-Phase ("Installing pinned npm dependencies for {0}." -f $Project)
  & $Npm --prefix $ProjectRoot ci --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw "npm ci failed for $Project with exit code $LASTEXITCODE." }
  New-Item -ItemType Directory -Path (Split-Path -Parent $Stamp) -Force | Out-Null
  Set-Content -LiteralPath $Stamp -Value $LockHash -NoNewline
}

$Elapsed = [DateTimeOffset]::UtcNow - $Started
Write-Phase ("Dependency preparation completed in {0:hh\:mm\:ss}." -f $Elapsed)
