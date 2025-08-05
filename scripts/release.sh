#!/bin/bash

# Release script for Effortless Resume Builder
# Usage: ./scripts/release.sh [patch|minor|major|version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Function to get current version from Cargo.toml
get_current_cargo_version() {
    grep '^version = ' src-tauri/Cargo.toml | cut -d'"' -f2
}

# Function to update version in package.json
update_package_version() {
    local new_version=$1
    npm version $new_version --no-git-tag-version
}

# Function to update version in Cargo.toml
update_cargo_version() {
    local new_version=$1
    sed -i "s/^version = \".*\"/version = \"$new_version\"/" src-tauri/Cargo.toml
}

# Function to update version in tauri.conf.json
update_tauri_version() {
    local new_version=$1
    sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" src-tauri/tauri.conf.json
}

# Function to check if working directory is clean
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory is not clean. Please commit or stash your changes."
        git status --short
        exit 1
    fi
}

# Function to create git tag
create_git_tag() {
    local version=$1
    git add .
    git commit -m "chore: bump version to $version"
    git tag -a "v$version" -m "Release v$version"
    print_success "Created git tag v$version"
}

# Function to push changes and tags
push_changes() {
    local version=$1
    print_status "Pushing changes and tags..."
    git push origin main
    git push origin "v$version"
    print_success "Pushed changes and tag v$version"
}

# Function to show help
show_help() {
    echo "Usage: $0 [patch|minor|major|version]"
    echo ""
    echo "Commands:"
    echo "  patch     Increment patch version (1.0.0 -> 1.0.1)"
    echo "  minor     Increment minor version (1.0.0 -> 1.1.0)"
    echo "  major     Increment major version (1.0.0 -> 2.0.0)"
    echo "  version   Show current version"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 patch"
    echo "  $0 minor"
    echo "  $0 major"
    echo "  $0 1.2.3"
}

# Main script logic
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi

    case $1 in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "version")
            local current_version=$(get_current_version)
            local cargo_version=$(get_current_cargo_version)
            echo "Current versions:"
            echo "  package.json: $current_version"
            echo "  Cargo.toml:   $cargo_version"
            if [ "$current_version" != "$cargo_version" ]; then
                print_warning "Versions are not synchronized!"
            fi
            exit 0
            ;;
        "patch"|"minor"|"major")
            check_git_status
            
            local current_version=$(get_current_version)
            print_status "Current version: $current_version"
            
            local new_version
            if [ "$1" = "patch" ]; then
                new_version=$(npm version $1 --no-git-tag-version)
            elif [ "$1" = "minor" ]; then
                new_version=$(npm version $1 --no-git-tag-version)
            elif [ "$1" = "major" ]; then
                new_version=$(npm version $1 --no-git-tag-version)
            fi
            
            # Remove the 'v' prefix that npm version adds
            new_version=${new_version#v}
            
            print_status "New version: $new_version"
            
            # Update Cargo.toml version
            update_cargo_version $new_version
            print_success "Updated Cargo.toml version to $new_version"
            
            # Update tauri.conf.json version
            update_tauri_version $new_version
            print_success "Updated tauri.conf.json version to $new_version"
            
            # Create git tag and push
            create_git_tag $new_version
            
            print_success "Version bumped to $new_version"
            print_status "To create a release, run: git push origin main && git push origin v$new_version"
            ;;
        *)
            # Assume it's a specific version
            local new_version=$1
            
            # Validate version format
            if [[ ! $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
                exit 1
            fi
            
            check_git_status
            
            local current_version=$(get_current_version)
            print_status "Current version: $current_version"
            print_status "New version: $new_version"
            
            # Update package.json version
            update_package_version $new_version
            
            # Update Cargo.toml version
            update_cargo_version $new_version
            print_success "Updated Cargo.toml version to $new_version"
            
            # Update tauri.conf.json version
            update_tauri_version $new_version
            print_success "Updated tauri.conf.json version to $new_version"
            
            # Create git tag and push
            create_git_tag $new_version
            
            print_success "Version set to $new_version"
            print_status "To create a release, run: git push origin main && git push origin v$new_version"
            ;;
    esac
}

# Run main function with all arguments
main "$@" 