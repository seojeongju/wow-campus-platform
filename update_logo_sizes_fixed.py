#!/usr/bin/env python3
"""
Update logo sizes in all page files to improve readability.
Changes from default/h-10 (40px) to h-16 md:h-20 (64px on mobile, 80px on desktop).
"""

import os
import re
from pathlib import Path

def update_logo_size_in_file(filepath):
    """Update logo size in a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match the img tag with WOW-CAMPUS alt text
    # This will match from <img src="data:image/png;base64, ... to the closing />
    pattern = r'(<img\s+src="data:image/png;base64,[^"]+"\s+alt="WOW-CAMPUS"\s+class=")([^"]+)("\s*/?>)'
    
    def replacement(match):
        # Replace the class value with new responsive sizes
        return f'{match.group(1)}h-16 md:h-20 w-auto{match.group(3)}'
    
    # Perform the replacement
    updated_content = re.sub(pattern, replacement, content)
    
    # Check if any changes were made
    if content != updated_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    return False

def main():
    """Update all page files with new logo sizes."""
    pages_dir = Path('src/pages')
    
    updated_files = []
    
    # Find all .tsx files in pages directory and subdirectories
    for tsx_file in pages_dir.rglob('*.tsx'):
        if update_logo_size_in_file(tsx_file):
            updated_files.append(tsx_file)
            print(f"✓ Updated: {tsx_file}")
    
    print(f"\n✅ Successfully updated {len(updated_files)} files")
    
    if updated_files:
        print("\nUpdated files:")
        for f in updated_files:
            print(f"  - {f}")

if __name__ == '__main__':
    main()
