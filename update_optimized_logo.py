#!/usr/bin/env python3
"""
Update all TSX files with the optimized transparent logo.
"""

import os
import re
from pathlib import Path

def update_logo_in_file(file_path, new_base64):
    """Update logo base64 in a single TSX file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match img tag with base64 data
    pattern = r'<img\s+src="data:image/(?:png|jpeg|jpg);base64,[^"]+"\s+alt="WOW-CAMPUS"\s+class="([^"]+)"\s*/>'
    
    matches = re.findall(pattern, content)
    
    if matches:
        # Replace with new base64
        replacement = f'<img src="data:image/png;base64,{new_base64}" alt="WOW-CAMPUS" class="\\1" />'
        new_content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return len(matches)
    
    return 0

def main():
    """Main function"""
    with open('logo_base64_small.txt', 'r') as f:
        new_base64 = f.read().strip()
    
    print(f"Optimized logo base64 length: {len(new_base64)} characters")
    print(f"Logo: 400x134px PNG with transparent background (45KB)\n")
    
    src_dir = Path('src/pages')
    tsx_files = list(src_dir.rglob('*.tsx'))
    
    total_updated = 0
    files_updated = 0
    
    for tsx_file in tsx_files:
        count = update_logo_in_file(tsx_file, new_base64)
        if count > 0:
            print(f"✓ Updated {count} logo(s) in: {tsx_file}")
            total_updated += count
            files_updated += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Files updated: {files_updated}")
    print(f"  Total logos replaced: {total_updated}")
    print(f"  Optimized logo: 400x134px PNG transparent (45KB)")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
