
const fs = require('fs');
const path = require('path');

const indexFile = 'src/index.tsx';
const publicStaticDir = 'public/static';

try {
  const content = fs.readFileSync(indexFile, 'utf8');
  console.log(`Read ${indexFile}: ${content.length} bytes`);

  // Helper function to extract content between markers
  function extractVariableContent(varName) {
    const startMarker = `const ${varName} = \``;
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
      console.log(`Could not find start of ${varName}`);
      return null;
    }

    const contentStart = startIndex + startMarker.length;
    
    // Find the end marker (`;) that is NOT escaped
    // Search forward from contentStart
    let searchIdx = contentStart;
    let foundEnd = -1;

    while (true) {
      const idx = content.indexOf('`;', searchIdx);
      if (idx === -1) break;

      // Check if the backtick is escaped (preceded by backslash)
      // Count consecutive backslashes before the backtick
      let backslashCount = 0;
      let i = idx - 1;
      while (i >= 0 && content[i] === '\\') {
        backslashCount++;
        i--;
      }

      // If even number of backslashes (0, 2, 4...), it's NOT escaped (it's the real end)
      // If odd number (1, 3...), it IS escaped (it's part of the string)
      if (backslashCount % 2 === 0) {
        foundEnd = idx;
        break;
      }

      searchIdx = idx + 1;
    }

    if (foundEnd === -1) {
      console.log(`Could not find end of ${varName}`);
      return null;
    }

    return content.substring(contentStart, foundEnd);
  }

  // Extract and Save
  const mappings = [
    { var: 'toastContent', file: 'toast.js' },
    { var: 'jsContent', file: 'app.js' },
    { var: 'cssContent', file: 'style.css' }
  ];

  if (!fs.existsSync(publicStaticDir)) {
    fs.mkdirSync(publicStaticDir, { recursive: true });
  }

  mappings.forEach(mapping => {
    console.log(`Extracting ${mapping.var}...`);
    let extracted = extractVariableContent(mapping.var);
    
    if (extracted) {
      // Unescape template literals
      // In the source, they are like: \`  or \$
      // We want to save them as: ` or $
      
      // Note: We need to handle backslashes carefully.
      // \\` -> `
      // \\$ -> $
      // \\ -> \ (if needed)

      // Replace escaped backticks
      extracted = extracted.replace(/\\`/g, '`');
      
      // Replace escaped dollar signs (for template literals ${...})
      extracted = extracted.replace(/\\\$/g, '$');
      
      // Replace escaped backslashes? 
      // If the original code had `\\`, it means a single backslash in the string.
      // But we are reading the file as raw string.
      // Wait, in the source code: 
      // const foo = `bar`; 
      // If the string contains a backslash, it is just `\`.
      // But if it contains a template literal inside, like `${`, we escaped it as `\${`.
      // So we just need to unescape ` and $.
      
      // Let's verify toast.js content from Step 20.
      // <i class="fas \${color.icon}" ...
      // This should become <i class="fas ${color.icon}" ...
      
      fs.writeFileSync(path.join(publicStaticDir, mapping.file), extracted, 'utf8');
      console.log(`Saved ${mapping.file} (${extracted.length} bytes)`);
    } else {
      console.error(`Failed to extract ${mapping.var}`);
    }
  });

} catch (err) {
  console.error('Error:', err);
}
