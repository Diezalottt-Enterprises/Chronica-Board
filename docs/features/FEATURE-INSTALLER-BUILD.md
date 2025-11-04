# FEATURE: Windows Installer Build and Distribution

**Status:** Partially Implemented (needs documentation and automation)
**Priority:** High (required for beta release)
**Complexity:** Low-Medium
**Estimated Time:** 4-6 hours
**Version Target:** v0.1.0-beta.1

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements](#requirements)
4. [Build Process Guide](#build-process-guide)
5. [Installer Types](#installer-types)
6. [Code Signing](#code-signing)
7. [Distribution Methods](#distribution-methods)
8. [Automation Setup](#automation-setup)
9. [Testing Checklist](#testing-checklist)
10. [Success Criteria](#success-criteria)

---

## Feature Overview

### What

Establish a reliable process for building, signing, and distributing Windows installers for Chronica. Document the build process and create automation scripts for release preparation.

### Why

- **User convenience**: Single-click installation with proper Windows integration
- **Professionalism**: Signed installers avoid SmartScreen warnings
- **Distribution**: Standardized release artifacts for beta testers and production users
- **Compliance**: Windows best practices for application installation

### User Benefit

- Download and install Chronica in seconds with a familiar Windows installer
- Automatic desktop shortcuts and Start menu entries
- Proper uninstallation via Windows Settings → Apps
- No security warnings from Windows Defender SmartScreen (when signed)

---

## Current State Analysis

### What Tauri Provides (Already Working)

Tauri automatically generates Windows installers when you run `pnpm tauri build`:

**Build Output Location:** `tauri/target/release/bundle/`

**Generated Files:**

1. **MSI Installer** (`.msi`)
   - Path: `tauri/target/release/bundle/msi/Chronica_0.1.0_x64_en-US.msi`
   - Windows Installer package with GUI wizard
   - Registers app in Windows Add/Remove Programs
   - Creates Start Menu shortcuts
   - Supports silent installation (`msiexec /i`)

2. **Standalone Executable** (`.exe`)
   - Path: `tauri/target/release/Chronica.exe`
   - Portable, no installation required
   - Can run from any directory
   - No system integration (no Start Menu, no uninstaller)

3. **NSIS Installer** (`.exe`) - Optional
   - Path: `tauri/target/release/bundle/nsis/Chronica_0.1.0_x64-setup.exe`
   - Alternative installer format (if configured)
   - Smaller file size than MSI
   - More customization options

### Current Configuration

**File:** `tauri/tauri.conf.json`

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

**What's Configured:**

- ✅ Bundle generation enabled
- ✅ All bundle formats (MSI, NSIS, standalone)
- ✅ Windows icon (`.ico`)
- ✅ Version synced from `package.json`

**What's Missing:**

- ❌ Code signing configuration
- ❌ Publisher information
- ❌ Custom installer branding
- ❌ Build automation script
- ❌ Distribution documentation
- ❌ Auto-update configuration (future)

---

## Requirements

### Functional Requirements

1. **Build Process**
   - Single command builds all installer types
   - Filenames include version number
   - Output organized by release version
   - Build logs captured for debugging

2. **Installer Features**
   - MSI installer with GUI wizard
   - Desktop shortcut (optional, user choice)
   - Start Menu entry
   - Autostart registry entry (when enabled in app settings)
   - Proper uninstallation removes all traces

3. **Code Signing (Optional for Beta, Required for v1.0)**
   - Sign .exe and .msi with Authenticode certificate
   - Avoid Windows SmartScreen warnings
   - Establish publisher trust

4. **Distribution**
   - Upload to GitLab Releases
   - SHA256 checksums for verification
   - Release notes linked from installer page

### Non-Functional Requirements

1. **Performance**: Build completes in under 10 minutes (Rust compilation + bundling)
2. **Size**: MSI installer under 10MB (standalone .exe under 8MB)
3. **Compatibility**: Windows 10+ (64-bit only)
4. **Reliability**: Build succeeds consistently without manual intervention

---

## Build Process Guide

### Prerequisites

**System Requirements:**

- Windows 10/11 (64-bit)
- Node.js 22+
- pnpm 9+
- Rust toolchain (install via [rustup.rs](https://rustup.rs/))
- Visual Studio Build Tools (for Windows API linking)

**Install Rust (First Time Only):**

```powershell
# Download and run rustup-init.exe from https://rustup.rs/
# Or use winget:
winget install Rustlang.Rustup
```

**Verify Setup:**

```powershell
node -v          # Should be 22.x
pnpm -v          # Should be 9.x
rustc --version  # Should be 1.70+
```

### Build Commands

#### Development Build (No Installer)

```powershell
pnpm tauri dev
```

- Fast hot-reload development
- No installer generation
- Uses Vite dev server

#### Production Build (With Installers)

```powershell
# Full build with all installers
pnpm tauri build
```

**What This Does:**

1. Syncs version from `src/version.ts` → `package.json`
2. Runs TypeScript compiler (`tsc`)
3. Builds frontend with Vite
4. Compiles Rust backend (5-10 minutes first time)
5. Bundles into MSI, NSIS, and standalone .exe
6. Places output in `tauri/target/release/bundle/`

**Build Time:**

- First build: 5-10 minutes (Rust compilation)
- Incremental builds: 1-3 minutes (only changed code)

#### Build Output

After `pnpm tauri build`, you'll find:

```
tauri/target/release/
├── Chronica.exe                          # Standalone (7.5 MB)
├── bundle/
│   ├── msi/
│   │   └── Chronica_0.1.0-alpha.7_x64_en-US.msi  # MSI installer (9.2 MB)
│   └── nsis/
│       └── Chronica_0.1.0-alpha.7_x64-setup.exe  # NSIS installer (8.8 MB)
```

---

## Installer Types

### MSI Installer (Recommended for Beta/Production)

**File:** `Chronica_0.1.0-alpha.7_x64_en-US.msi`

**Pros:**

- Native Windows Installer format
- Full GUI installation wizard
- Registers in Windows Add/Remove Programs
- Supports silent installation (`msiexec /i /quiet`)
- Creates Start Menu shortcuts
- Integrates with Windows Update (future)
- Enterprise deployment via Group Policy

**Cons:**

- Larger file size (~9 MB vs 8 MB)
- Slower installation (unpacks to Program Files)
- Requires admin privileges

**Installation Locations:**

- App: `C:\Program Files\Chronica\`
- User data: `%AppData%\Chronica\`
- Start Menu: `Start → All Apps → Chronica`

**Uninstallation:**

- Windows Settings → Apps → Chronica → Uninstall
- Or: `msiexec /x Chronica_0.1.0-alpha.7_x64_en-US.msi /quiet`

### NSIS Installer

**File:** `Chronica_0.1.0-alpha.7_x64-setup.exe`

**Pros:**

- Smaller file size (~8.8 MB)
- Faster installation
- More customization (splash screens, license pages)
- Better for personal distribution

**Cons:**

- Less enterprise-friendly
- No built-in silent install flag
- Requires manual uninstaller

**Use Case:** Good for indie developers, not ideal for enterprise deployment.

### Standalone Executable

**File:** `Chronica.exe` (7.5 MB)

**Pros:**

- No installation required
- Portable (run from USB drive)
- Fastest to distribute (single file)
- No admin privileges needed

**Cons:**

- No system integration (no Start Menu, no uninstaller)
- User must manually create shortcuts
- Autostart not available
- Data stored in current directory (not %AppData%)

**Use Case:** For power users who want portable version or testing.

---

## Code Signing

### Why Sign?

**Windows SmartScreen Warning (Unsigned):**

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

[Don't run]
```

**After Signing:**

- No SmartScreen warning (after establishing reputation)
- Shows publisher name in UAC prompts
- Users trust signed apps more

### Certificate Options

#### 1. Self-Signed Certificate (Free, For Testing Only)

**Pros:** Free, immediate
**Cons:** Still triggers SmartScreen, not trusted

**Create Self-Signed Cert (PowerShell as Admin):**

```powershell
$cert = New-SelfSignedCertificate `
  -Type CodeSigningCert `
  -Subject "CN=Chronica Development" `
  -CertStoreLocation Cert:\CurrentUser\My

Export-PfxCertificate `
  -Cert $cert `
  -FilePath "chronica-dev.pfx" `
  -Password (ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText)
```

#### 2. Standard Code Signing Certificate ($50-200/year)

**Providers:**

- DigiCert (~$200/year)
- Sectigo (~$100/year)
- SSL.com (~$80/year)

**Pros:** Trusted by Windows, removes SmartScreen after reputation build
**Cons:** Annual cost, requires business verification

#### 3. Extended Validation (EV) Certificate ($300-500/year)

**Providers:**

- DigiCert
- Sectigo

**Pros:** Immediate SmartScreen trust (no reputation build needed)
**Cons:** Expensive, requires hardware USB token, strict identity verification

**Recommendation for Beta:** Use unsigned builds, add "How to bypass SmartScreen" instructions.
**Recommendation for v1.0:** Purchase Standard Code Signing Certificate.

### Signing Process

**Manual Signing (After Build):**

```powershell
# Sign MSI installer
signtool sign /f "certificate.pfx" /p "password" /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 "tauri/target/release/bundle/msi/Chronica_0.1.0-alpha.7_x64_en-US.msi"

# Sign standalone .exe
signtool sign /f "certificate.pfx" /p "password" /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 "tauri/target/release/Chronica.exe"

# Sign NSIS installer
signtool sign /f "certificate.pfx" /p "password" /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 "tauri/target/release/bundle/nsis/Chronica_0.1.0-alpha.7_x64-setup.exe"
```

**Automated Signing (Tauri Config):**

Add to `tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT_HERE",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

---

## Distribution Methods

### Method 1: GitLab Releases (Recommended)

**Process:**

1. Build installers
2. Create GitLab Release tag (e.g., `v0.1.0-beta.1`)
3. Upload artifacts:
   - `Chronica_0.1.0-beta.1_x64_en-US.msi`
   - `Chronica_0.1.0-beta.1_x64-setup.exe` (NSIS)
   - `Chronica.exe` (standalone, zipped)
   - `SHA256SUMS.txt` (checksums)
   - `CHANGELOG.md` (release notes)
4. Link release in README

**GitLab Release Command:**

```bash
# Create release via GitLab CLI
glab release create v0.1.0-beta.1 \
  --name "Chronica v0.1.0-beta.1" \
  --notes-file CHANGELOG.md \
  --assets-links '{"name":"MSI Installer","url":"https://...msi"}'
```

### Method 2: Direct Download (Website/Docs)

Host installers on:

- GitLab Pages
- GitHub Releases (mirror)
- CDN (Cloudflare R2, AWS S3)

**Download page should include:**

- Download buttons for MSI/NSIS/Standalone
- SHA256 checksums
- "How to bypass SmartScreen" instructions (if unsigned)
- System requirements

### Method 3: Package Managers (Future)

**Winget (Windows Package Manager):**

```yaml
# manifests/c/Chronica/Chronica/0.1.0-beta.1.yaml
PackageIdentifier: Chronica.Chronica
PackageVersion: 0.1.0-beta.1
PackageLocale: en-US
Publisher: Chronica
PackageName: Chronica
License: MIT
ShortDescription: Desktop sticky kanban widget
Installers:
  - InstallerType: msi
    InstallerUrl: https://gitlab.com/.../Chronica_0.1.0-beta.1_x64_en-US.msi
    InstallerSha256: abc123...
```

**Chocolatey:**

```powershell
# chronica.nuspec
choco pack
choco push chronica.0.1.0-beta.1.nupkg --source https://push.chocolatey.org/
```

---

## Automation Setup

### Build Script

**File:** `scripts/build-release.ps1` (NEW)

```powershell
# Chronica Release Build Script
# Builds installers and prepares release artifacts

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "releases"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Chronica Release Build ===" -ForegroundColor Cyan

# 1. Get version from version.ts
Write-Host "Reading version..." -ForegroundColor Yellow
$versionFile = Get-Content "src/version.ts" -Raw
if ($versionFile -match 'export const VERSION = "([^"]+)"') {
    $version = $Matches[1]
    Write-Host "Version: $version" -ForegroundColor Green
} else {
    Write-Error "Failed to extract version from src/version.ts"
    exit 1
}

# 2. Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "tauri/target/release/bundle") {
    Remove-Item -Recurse -Force "tauri/target/release/bundle"
}

# 3. Build installers
Write-Host "Building installers (this may take 5-10 minutes)..." -ForegroundColor Yellow
pnpm tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# 4. Create release directory
$releaseDir = "$OutputDir/v$version"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
Write-Host "Release directory: $releaseDir" -ForegroundColor Green

# 5. Copy artifacts
Write-Host "Copying artifacts..." -ForegroundColor Yellow

$msiPath = Get-ChildItem "tauri/target/release/bundle/msi/*.msi" | Select-Object -First 1
$nsisPath = Get-ChildItem "tauri/target/release/bundle/nsis/*-setup.exe" | Select-Object -First 1
$exePath = "tauri/target/release/Chronica.exe"

Copy-Item $msiPath.FullName "$releaseDir/Chronica_${version}_x64_en-US.msi"
Copy-Item $nsisPath.FullName "$releaseDir/Chronica_${version}_x64-setup.exe"

# Zip standalone exe
Compress-Archive -Path $exePath -DestinationPath "$releaseDir/Chronica_${version}_standalone.zip" -Force

# 6. Generate SHA256 checksums
Write-Host "Generating checksums..." -ForegroundColor Yellow
$checksums = @()
Get-ChildItem "$releaseDir/*" | ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()
    $checksums += "$hash  $($_.Name)"
}
$checksums | Out-File -FilePath "$releaseDir/SHA256SUMS.txt" -Encoding utf8

# 7. Copy changelog
Copy-Item "CHANGELOG" "$releaseDir/CHANGELOG.md"

# 8. Summary
Write-Host "`n=== Build Complete ===" -ForegroundColor Green
Write-Host "Release artifacts in: $releaseDir" -ForegroundColor Cyan
Write-Host "`nFiles:" -ForegroundColor Yellow
Get-ChildItem $releaseDir | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $($_.Name) ($size MB)"
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Test installers on clean Windows VM"
Write-Host "  2. Create GitLab release: glab release create v$version"
Write-Host "  3. Upload artifacts from $releaseDir"
```

**Usage:**

```powershell
# Build release
.\scripts\build-release.ps1

# Custom output directory
.\scripts\build-release.ps1 -OutputDir "dist"
```

---

## Testing Checklist

### Pre-Build Testing

- [ ] Version updated in `src/version.ts`
- [ ] `package.json` synced (run `pnpm sync-version`)
- [ ] All tests passing (`pnpm test`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Formatting clean (`pnpm format`)
- [ ] Rust code compiles (`pnpm tauri build` dry run)

### Build Testing

- [ ] MSI installer builds successfully
- [ ] NSIS installer builds successfully
- [ ] Standalone .exe builds successfully
- [ ] File sizes reasonable (<10 MB for MSI)
- [ ] SHA256 checksums generated
- [ ] No build warnings or errors

### Installation Testing (Clean Windows VM)

**MSI Installer:**

- [ ] Double-click MSI opens installer wizard
- [ ] Wizard shows correct version number
- [ ] Installation completes without errors
- [ ] App appears in Start Menu
- [ ] Desktop shortcut created (if selected)
- [ ] App launches from Start Menu
- [ ] App launches from desktop shortcut
- [ ] System tray icon appears
- [ ] Settings → Autostart toggle works
- [ ] Close button hides window (doesn't quit)
- [ ] System tray → Quit fully closes app
- [ ] Restart Windows → App autostarts (if enabled)

**Uninstallation:**

- [ ] Windows Settings → Apps → Chronica → Uninstall
- [ ] Uninstaller removes app from Program Files
- [ ] Start Menu shortcut removed
- [ ] Desktop shortcut removed
- [ ] User data preserved in %AppData% (boards, config)
- [ ] Reinstall works without issues

**Standalone .exe:**

- [ ] Extract from .zip
- [ ] Double-click Chronica.exe launches app
- [ ] App works without installation
- [ ] Data stored in current directory (not %AppData%)
- [ ] No Start Menu entry
- [ ] No uninstaller needed (just delete .exe)

### Upgrade Testing

- [ ] Install previous version (e.g., alpha.6)
- [ ] Create some boards and cards
- [ ] Install new version (alpha.7) over it
- [ ] App launches successfully
- [ ] Boards and cards preserved
- [ ] Config settings preserved (pinned, opacity, autostart)
- [ ] No data loss

---

## Success Criteria

### Build Process

1. ✅ Single command (`pnpm tauri build`) produces all installers
2. ✅ Build completes in under 10 minutes
3. ✅ Artifacts organized in release directory
4. ✅ Filenames include version number
5. ✅ SHA256 checksums generated

### Installer Quality

1. ✅ MSI installer under 10 MB
2. ✅ Installation completes in under 30 seconds
3. ✅ Start Menu shortcut works
4. ✅ Autostart integration works
5. ✅ Uninstallation clean (no leftover files except user data)

### Documentation

1. ✅ Build process documented (this file)
2. ✅ Distribution guide written
3. ✅ Testing checklist complete
4. ✅ "How to bypass SmartScreen" instructions (if unsigned)

### Distribution

1. ✅ Installers uploaded to GitLab Releases
2. ✅ Release notes linked
3. ✅ Download page created (README or website)
4. ✅ SHA256 checksums published

---

## Future Enhancements

### Auto-Update (v0.2.0+)

Tauri supports built-in auto-update via updater plugin:

**Add to `tauri/tauri.conf.json`:**

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://gitlab.com/stack-junkie-projects/chronica-board/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

**Implementation:**

1. Generate signing keypair
2. Sign each release
3. Host `latest.json` with download URLs
4. App checks for updates on launch
5. User prompted to download and install

**References:**

- [Tauri Updater Plugin](https://tauri.app/v1/guides/distribution/updater/)

### Package Manager Support (v1.0+)

1. **Winget:** Submit manifest to [winget-pkgs](https://github.com/microsoft/winget-pkgs)
2. **Chocolatey:** Create `.nuspec` and publish
3. **Scoop:** Create bucket and manifest

---

## Files to Create/Modify

### New Files

1. **`scripts/build-release.ps1`** (~80 lines)
   - Automated build script
2. **`docs/INSTALLATION.md`** (~50 lines)
   - User-facing installation instructions
3. **`docs/BUILD-GUIDE.md`** (~100 lines)
   - Developer build instructions

### Modified Files

1. **`tauri/tauri.conf.json`** (+5 lines)
   - Add publisher info
2. **`README.md`** (+10 lines)
   - Link to download page
3. **`CLAUDE.md`** (+3 lines)
   - Add build command reference

---

## Quick Start for Beta Release

**1. Install Rust (if not installed):**

```powershell
winget install Rustlang.Rustup
```

**2. Build installers:**

```powershell
pnpm tauri build
```

**3. Find installers:**

```
tauri/target/release/bundle/msi/Chronica_0.1.0-beta.1_x64_en-US.msi
```

**4. Test on clean Windows VM**

**5. Upload to GitLab Releases**

**6. Share download link**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Author:** Claude Code
**Status:** Ready for Implementation
