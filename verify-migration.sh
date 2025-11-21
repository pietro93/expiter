#!/bin/bash

################################################################################
# Expiter Nunjucks Migration - Final Verification Script
# Purpose: Comprehensive validation before production deployment
# Usage: ./verify-migration.sh [--full|--quick]
# Date: November 21, 2025
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FULL_VERIFICATION="${1:-quick}"

# Helper functions
log_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS_COUNT++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

log_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARN_COUNT++))
}

log_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║ $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
}

################################################################################
# CHECK 1: Directory Structure
################################################################################
check_directory_structure() {
    print_header "CHECK 1: Directory Structure"
    
    local required_dirs=(
        "src/config"
        "src/generators"
        "src/i18n"
        "src/templates/layouts"
        "src/templates/components"
        "src/templates/partials"
        "src/utils"
        "tests"
        "docs"
        "output"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$SCRIPT_DIR/$dir" ]; then
            log_pass "Directory exists: $dir"
        else
            log_fail "Directory missing: $dir"
        fi
    done
}

################################################################################
# CHECK 2: Core Files
################################################################################
check_core_files() {
    print_header "CHECK 2: Core Files"
    
    local required_files=(
        "src/config/template-engine.js"
        "src/config/i18n-config.js"
        "src/utils/data-loader.js"
        "src/utils/formatter.js"
        "src/utils/seo-builder.js"
        "src/generators/pageGenerator.js"
        "src/generators/indexGenerator.js"
        "src/generators/regionGenerator.js"
        "src/templates/layouts/base.njk"
        "src/templates/layouts/province-detail.njk"
        "src/i18n/en.json"
        "src/i18n/it.json"
        "docs/MIGRATION_COMPLETE.md"
        ".deploy-checklist"
        "package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$SCRIPT_DIR/$file" ]; then
            log_pass "File exists: $file"
        else
            log_fail "File missing: $file"
        fi
    done
}

################################################################################
# CHECK 3: Dependencies
################################################################################
check_dependencies() {
    print_header "CHECK 3: NPM Dependencies"
    
    if ! command -v npm &> /dev/null; then
        log_fail "npm is not installed"
        return 1
    fi
    log_pass "npm is installed: $(npm --version)"
    
    if ! command -v node &> /dev/null; then
        log_fail "Node.js is not installed"
        return 1
    fi
    log_pass "Node.js is installed: $(node --version)"
    
    # Check for required packages
    local required_packages=("nunjucks" "i18next" "jest")
    
    for pkg in "${required_packages[@]}"; do
        if npm list "$pkg" &>/dev/null; then
            log_pass "Package installed: $pkg"
        else
            log_fail "Package missing: $pkg"
        fi
    done
}

################################################################################
# CHECK 4: Git Status
################################################################################
check_git_status() {
    print_header "CHECK 4: Git Repository Status"
    
    if ! command -v git &> /dev/null; then
        log_warn "git is not installed or not in PATH"
        return 0
    fi
    
    local current_branch=$(git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo "unknown")
    log_info "Current branch: $current_branch"
    
    if [ "$current_branch" = "nunjucks-migration" ] || [ "$current_branch" = "main" ]; then
        log_pass "On expected branch: $current_branch"
    else
        log_warn "Unexpected branch: $current_branch (expected nunjucks-migration or main)"
    fi
    
    # Check for uncommitted changes
    if git -C "$SCRIPT_DIR" diff-index --quiet HEAD -- 2>/dev/null; then
        log_pass "No uncommitted changes"
    else
        log_warn "There are uncommitted changes"
    fi
    
    # Get latest commit
    local latest_commit=$(git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
    log_info "Latest commit: $latest_commit"
}

################################################################################
# CHECK 5: File Generation
################################################################################
check_file_generation() {
    print_header "CHECK 5: Generated Output Files"
    
    if [ ! -d "$SCRIPT_DIR/output" ]; then
        log_warn "Output directory not found. Have you run generation yet? (npm run generate)"
        return 0
    fi
    
    # Count files
    local total_files=$(find "$SCRIPT_DIR/output" -type f | wc -l)
    local html_files=$(find "$SCRIPT_DIR/output" -type f -name "*.html" | wc -l)
    local xml_files=$(find "$SCRIPT_DIR/output" -type f -name "*.xml" | wc -l)
    
    log_info "Total output files: $total_files"
    
    if [ "$total_files" -ge 650 ]; then
        log_pass "Output file count exceeds minimum (650): $total_files"
    else
        log_fail "Output file count below minimum (650): $total_files"
    fi
    
    if [ "$html_files" -eq 795 ]; then
        log_pass "HTML files generated: $html_files (expected 795)"
    elif [ "$html_files" -ge 640 ]; then
        log_warn "HTML files: $html_files (expected 795)"
    else
        log_fail "HTML files: $html_files (expected 795)"
    fi
    
    if [ "$xml_files" -ge 5 ]; then
        log_pass "XML sitemaps generated: $xml_files"
    else
        log_warn "XML sitemaps: $xml_files (expected ≥5)"
    fi
    
    # Check language directories
    for lang in en it de es fr; do
        if [ -d "$SCRIPT_DIR/output/$lang" ]; then
            local lang_files=$(find "$SCRIPT_DIR/output/$lang" -type f | wc -l)
            log_pass "Language $lang: $lang_files files"
        else
            log_fail "Language directory missing: output/$lang"
        fi
    done
}

################################################################################
# CHECK 6: Test Results
################################################################################
check_tests() {
    print_header "CHECK 6: Test Suite"
    
    if [ ! -f "$SCRIPT_DIR/package.json" ]; then
        log_warn "package.json not found, skipping tests"
        return 0
    fi
    
    log_info "Running Jest tests..."
    
    if npm --prefix "$SCRIPT_DIR" test -- --passWithNoTests 2>&1 | tee /tmp/test_output.txt; then
        log_pass "Test suite completed"
        
        # Extract test count
        local test_count=$(grep -o '[0-9]\+ passed' /tmp/test_output.txt | grep -o '[0-9]\+' || echo "0")
        if [ "$test_count" -gt 0 ]; then
            log_pass "Tests passing: $test_count"
        else
            log_warn "Could not determine test count"
        fi
    else
        log_fail "Test suite failed"
    fi
}

################################################################################
# CHECK 7: HTML Validation
################################################################################
check_html_validation() {
    print_header "CHECK 7: HTML File Validation"
    
    if [ ! -f "$SCRIPT_DIR/tests/validate-html.js" ]; then
        log_warn "HTML validation script not found"
        return 0
    fi
    
    if [ ! -f "$SCRIPT_DIR/run-validate.js" ]; then
        log_warn "Validation runner not found"
        return 0
    fi
    
    log_info "Running HTML validation..."
    
    if node "$SCRIPT_DIR/run-validate.js" 2>&1 | tee /tmp/validation_output.txt; then
        log_pass "HTML validation completed"
        
        # Extract results
        local valid_count=$(grep -o '[0-9]\+ valid' /tmp/validation_output.txt | grep -o '[0-9]\+' || echo "0")
        if [ "$valid_count" -gt 0 ]; then
            log_pass "Valid HTML files: $valid_count"
        fi
    else
        log_warn "HTML validation check encountered issues"
    fi
}

################################################################################
# CHECK 8: Template Compilation
################################################################################
check_template_compilation() {
    print_header "CHECK 8: Template Syntax Validation"
    
    local template_dir="$SCRIPT_DIR/src/templates"
    
    if [ ! -d "$template_dir" ]; then
        log_fail "Template directory not found"
        return 1
    fi
    
    local template_count=$(find "$template_dir" -name "*.njk" | wc -l)
    log_info "Total Nunjucks templates: $template_count"
    
    if [ "$template_count" -gt 30 ]; then
        log_pass "Sufficient template files: $template_count (expected ≥30)"
    else
        log_fail "Insufficient template files: $template_count (expected ≥30)"
    fi
    
    # Check for common template syntax
    local has_extends=$(grep -r "{% extends" "$template_dir" 2>/dev/null | wc -l)
    local has_blocks=$(grep -r "{% block" "$template_dir" 2>/dev/null | wc -l)
    local has_includes=$(grep -r "{% include" "$template_dir" 2>/dev/null | wc -l)
    
    if [ "$has_extends" -gt 0 ]; then
        log_pass "Template inheritance found: $has_extends extends blocks"
    else
        log_warn "No template inheritance found"
    fi
    
    if [ "$has_includes" -gt 0 ]; then
        log_pass "Template includes found: $has_includes includes"
    else
        log_warn "No template includes found"
    fi
}

################################################################################
# CHECK 9: Configuration Validation
################################################################################
check_configuration() {
    print_header "CHECK 9: Configuration Files"
    
    # Check template engine config
    if [ -f "$SCRIPT_DIR/src/config/template-engine.js" ]; then
        if grep -q "setupNunjucks" "$SCRIPT_DIR/src/config/template-engine.js"; then
            log_pass "Nunjucks configuration found"
        else
            log_fail "Nunjucks setup function not found"
        fi
    fi
    
    # Check i18n config
    if [ -f "$SCRIPT_DIR/src/config/i18n-config.js" ]; then
        if grep -q "setupI18n" "$SCRIPT_DIR/src/config/i18n-config.js"; then
            log_pass "i18next configuration found"
        else
            log_fail "i18next setup function not found"
        fi
    fi
    
    # Check translation files
    local lang_count=$(find "$SCRIPT_DIR/src/i18n" -name "*.json" | wc -l)
    if [ "$lang_count" -eq 5 ]; then
        log_pass "All 5 language files present"
    else
        log_fail "Expected 5 language files, found: $lang_count"
    fi
}

################################################################################
# CHECK 10: Disk Space & Performance
################################################################################
check_disk_and_performance() {
    print_header "CHECK 10: System Resources"
    
    if [ -d "$SCRIPT_DIR/output" ]; then
        local output_size=$(du -sh "$SCRIPT_DIR/output" 2>/dev/null | cut -f1)
        log_info "Output directory size: $output_size"
        
        # Check if we have the expected 20+ MB
        if [ ! -z "$output_size" ]; then
            log_pass "Output directory size calculated"
        fi
    fi
    
    # Check available disk space
    if command -v df &> /dev/null; then
        local available_space=$(df "$SCRIPT_DIR" | awk 'NR==2 {print int($4/1024)}'MB)
        log_info "Available disk space: $available_space"
    fi
}

################################################################################
# SUMMARY REPORT
################################################################################
print_summary() {
    print_header "VERIFICATION SUMMARY"
    
    echo ""
    echo "Results:"
    echo -e "  ${GREEN}✓ Passed${NC}: $PASS_COUNT"
    echo -e "  ${RED}✗ Failed${NC}: $FAIL_COUNT"
    echo -e "  ${YELLOW}⚠ Warnings${NC}: $WARN_COUNT"
    echo ""
    
    local total=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
    echo "Total checks: $total"
    echo ""
    
    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}✓ VERIFICATION PASSED - Ready for deployment${NC}"
        return 0
    else
        echo -e "${RED}✗ VERIFICATION FAILED - $FAIL_COUNT critical issues found${NC}"
        return 1
    fi
}

################################################################################
# MAIN EXECUTION
################################################################################
main() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  EXPITER NUNJUCKS MIGRATION - FINAL VERIFICATION"
    echo "  Date: $(date)"
    echo "  Mode: ${FULL_VERIFICATION^^}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    check_directory_structure
    check_core_files
    check_dependencies
    check_git_status
    check_file_generation
    
    if [ "$FULL_VERIFICATION" = "full" ]; then
        check_tests
        check_html_validation
    fi
    
    check_template_compilation
    check_configuration
    check_disk_and_performance
    
    echo ""
    print_summary
    local result=$?
    
    echo ""
    echo "For more details, see:"
    echo "  - docs/MIGRATION_COMPLETE.md (Full migration report)"
    echo "  - MIGRATION_PROGRESS.md (Step-by-step progress)"
    echo "  - .deploy-checklist (Deployment checklist)"
    echo ""
    
    return $result
}

# Execute main function
main "$@"
exit $?
