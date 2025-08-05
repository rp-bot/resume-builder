# Release Process Documentation

This document outlines the complete release process for the Effortless Resume Builder application, including setup, automation, and manual steps.

## Overview

The release process is fully automated using GitHub Actions and includes:

- **Cross-platform builds** for Windows, macOS, and Linux
- **Automatic versioning** with semantic versioning support
- **Release creation** with proper assets and documentation
- **CI/CD pipeline** for testing and validation

## Prerequisites

### 1. GitHub Repository Setup

Ensure your repository has the following:

- **GitHub Actions enabled** (should be enabled by default)
- **Proper permissions** for the `GITHUB_TOKEN` secret
- **Main branch protection** (recommended but not required)

### 2. Required Secrets (Optional but Recommended)

For enhanced security and functionality, consider setting up these secrets in your GitHub repository:

```bash
# Go to Settings > Secrets and variables > Actions
# Add the following secrets if needed:

# For code signing (optional)
WINDOWS_CERTIFICATE_PASSWORD=your_cert_password
MACOS_APPLE_ID=your_apple_id
MACOS_APPLE_ID_PASSWORD=your_app_specific_password
MACOS_TEAM_ID=your_team_id

# For automatic updates (optional)
TAURI_PRIVATE_KEY=your_private_key
TAURI_KEY_PASSWORD=your_key_password
```

## Release Workflow

### Automated Release Process

The release process is triggered in two ways:

1. **Tag-based release**: Push a tag starting with `v` (e.g., `v1.0.0`)
2. **Manual release**: Use the GitHub Actions UI to trigger a release with a specific version

### Step-by-Step Release Process

#### 1. Prepare for Release

```bash
# Ensure you're on the main branch
git checkout main
git pull origin main

# Check current version
npm run release:version

# Make sure working directory is clean
git status
```

#### 2. Bump Version

Choose the appropriate version bump based on your changes:

```bash
# For bug fixes and patches
npm run release:patch

# For new features (backward compatible)
npm run release:minor

# For breaking changes
npm run release:major

# Or specify a specific version
./scripts/release.sh 1.2.3
```

The script will:

- Update version in `package.json`
- Update version in `src-tauri/Cargo.toml`
- Update version in `src-tauri/tauri.conf.json`
- Create a git commit with the version bump
- Create a git tag

#### 3. Push Changes and Trigger Release

```bash
# Push the changes and tag
git push origin main
git push origin v1.0.0  # Replace with your version
```

This will automatically trigger the GitHub Actions release workflow.

#### 4. Monitor the Release Process

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Monitor the "Release" workflow
4. The workflow will:
   - Create a GitHub release
   - Build for all platforms (Windows, macOS, Linux)
   - Upload assets to the release

## Build Artifacts

The release process creates the following artifacts:

### Windows

- **MSI Installer**: `EffortlessResume-{version}-x64.msi`
- **NSIS Installer**: `EffortlessResume-{version}-x64-setup.exe`

### macOS

- **DMG Package**: `EffortlessResume-{version}-x64.dmg`
- **App Bundle**: `EffortlessResume-{version}-x64.app`

### Linux

- **AppImage**: `EffortlessResume-{version}-x64.AppImage`
- **DEB Package**: `EffortlessResume-{version}-x64.deb`

## CI/CD Pipeline

### Continuous Integration (CI)

The CI workflow runs on:

- Every push to `main` and `develop` branches
- Every pull request to `main`

**CI Jobs:**

1. **Test**: Runs TypeScript compilation and any configured tests
2. **Build Linux**: Builds the application for Linux to ensure it compiles correctly

### Continuous Deployment (CD)

The CD workflow runs on:

- Every tag push (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI

**CD Jobs:**

1. **Create Release**: Creates a GitHub release
2. **Build Windows**: Builds Windows artifacts
3. **Build macOS**: Builds macOS artifacts
4. **Build Linux**: Builds Linux artifacts
5. **Upload Assets**: Uploads all artifacts to the release

## Manual Release Process

If you need to create a release manually:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Release" workflow
4. Click "Run workflow"
5. Enter the version number (e.g., `1.0.0`)
6. Click "Run workflow"

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails on one or more platforms

**Solutions**:

- Check the GitHub Actions logs for specific error messages
- Ensure all dependencies are properly specified
- Verify that the Tauri configuration is correct
- Test builds locally before releasing

#### 2. Version Synchronization

**Problem**: Versions are not synchronized between files

**Solution**: Use the release script which automatically updates all version files:

```bash
npm run release:version  # Check current versions
./scripts/release.sh patch  # Bump version in all files
```

#### 3. Missing Artifacts

**Problem**: Some platform artifacts are missing from the release

**Solutions**:

- Check if the build job for that platform completed successfully
- Verify that the artifact paths in the workflow are correct
- Ensure the Tauri bundle configuration includes the target platform

### Debugging Workflows

To debug workflow issues:

1. **Check workflow logs**: Go to Actions > [Workflow Name] > [Run] > [Job] > [Step]
2. **Enable debug logging**: Add `ACTIONS_STEP_DEBUG: true` to repository secrets
3. **Test locally**: Run `npm run tauri build` locally to identify issues

## Best Practices

### 1. Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Always test locally before releasing
- Keep versions synchronized across all files

### 2. Release Notes

- Write clear, descriptive release notes
- Include breaking changes prominently
- List new features and bug fixes
- Provide migration guides if needed

### 3. Testing

- Test the application on all target platforms
- Verify that the installer/package works correctly
- Test the application functionality after installation

### 4. Security

- Keep dependencies updated
- Use the latest stable versions of Tauri and Rust
- Regularly audit your dependencies

## Advanced Configuration

### Code Signing (Optional)

For production releases, consider implementing code signing:

#### Windows Code Signing

1. Obtain a code signing certificate
2. Add the certificate password to GitHub secrets
3. Configure the workflow to use the certificate

#### macOS Code Signing

1. Enroll in the Apple Developer Program
2. Add Apple ID credentials to GitHub secrets
3. Configure notarization in the workflow

### Automatic Updates

To enable automatic updates:

1. Generate a Tauri key pair
2. Add the private key to GitHub secrets
3. Configure the updater in `tauri.conf.json`

## Support

If you encounter issues with the release process:

1. Check the troubleshooting section above
2. Review the GitHub Actions logs
3. Test the build process locally
4. Open an issue in the repository with detailed information

## Contributing

To improve the release process:

1. Fork the repository
2. Make your changes
3. Test the workflow thoroughly
4. Submit a pull request with detailed description

---

For more information about Tauri releases, see the [official Tauri documentation](https://tauri.app/v1/guides/distribution/).
