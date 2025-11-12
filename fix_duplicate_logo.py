#!/usr/bin/env python3
"""
Fix duplicate logo class attributes in TSX files.
This script removes the duplicated 'class="h-16 md:h-20 w-auto" />' pattern.
"""

import os
import re
from pathlib import Path

def fix_duplicate_logo(file_path):
    """Fix duplicate logo class in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match the duplicate: ...w-auto" />class="h-16 md:h-20 w-auto" />
    pattern = r'(w-auto")\s*/>\s*class="h-16\s+md:h-20\s+w-auto"\s*/>'
    
    # Replace with just the closing tag
    fixed_content = re.sub(pattern, r'\1 />', content)
    
    if content != fixed_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True
    return False

def main():
    """Main function to fix all TSX files"""
    src_dir = Path('src/pages')
    tsx_files = list(src_dir.rglob('*.tsx'))
    
    fixed_count = 0
    for tsx_file in tsx_files:
        if fix_duplicate_logo(tsx_file):
            print(f"Fixed: {tsx_file}")
            fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    main()
