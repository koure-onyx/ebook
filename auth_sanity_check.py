import os
import re
import subprocess

def check_typescript_syntax(file_path):
    """Basic syntax check for TypeScript files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for basic syntax issues
        issues = []
        
        # Check for unmatched braces
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            issues.append(f"Unmatched braces: {open_braces} open, {close_braces} close")
        
        # Check for unmatched parentheses
        open_parens = content.count('(')
        close_parens = content.count(')')
        if open_parens != close_parens:
            issues.append(f"Unmatched parentheses: {open_parens} open, {close_parens} close")
        
        # Check for basic import/export syntax
        if 'import' in content and not re.search(r'import\s+.*\s+from\s+["\'].*["\']', content):
            # Allow side-effect imports
            if not re.search(r'import\s+["\'].*["\']', content):
                issues.append("Potential malformed import statement")
        
        return issues
    except Exception as e:
        return [f"Error reading file: {str(e)}"]

def main():
    print("=== AUTH SANITY CHECK ===\n")
    
    # Files modified in Step 4
    target_files = [
        "student/app/(dashboard)/layout.tsx",
        "student/app/(auth)/onboarding/page.tsx",
        "student/app/(auth)/onboarding/onboarding-form.tsx",
        "student/lib/auth.ts",
        "admin/lib/auth.ts"
    ]
    
    all_issues = []
    
    for file_path in target_files:
        full_path = os.path.join(os.getcwd(), file_path)
        if os.path.exists(full_path):
            print(f"✓ Checking: {file_path}")
            issues = check_typescript_syntax(full_path)
            if issues:
                for issue in issues:
                    print(f"  ⚠ {issue}")
                all_issues.extend(issues)
            else:
                print(f"  ✓ No syntax anomalies detected")
        else:
            print(f"✗ File not found: {file_path}")
            all_issues.append(f"File not found: {file_path}")
    
    print("\n=== SUMMARY ===")
    if all_issues:
        print(f"❌ Found {len(all_issues)} issue(s)")
        return 1
    else:
        print("✅ All files passed sanity check")
        return 0

if __name__ == "__main__":
    exit(main())
