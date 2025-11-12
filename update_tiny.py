import re
from pathlib import Path

with open('logo_base64_tiny.txt', 'r') as f:
    new_base64 = f.read().strip()

pattern = r'<img\s+src="data:image/(?:png|jpeg|jpg);base64,[^"]+"\s+alt="WOW-CAMPUS"\s+class="([^"]+)"\s*/>'
replacement = f'<img src="data:image/png;base64,{new_base64}" alt="WOW-CAMPUS" class="\\1" />'

for tsx_file in Path('src/pages').rglob('*.tsx'):
    with open(tsx_file, 'r') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if content != new_content:
        with open(tsx_file, 'w') as f:
            f.write(new_content)
        print(f"✓ {tsx_file}")
