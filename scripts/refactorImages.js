import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../src');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = walk(srcDir);

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Quick skip
  if (!content.includes('/images/')) continue;
  if (file.includes('getImageUrl.js')) continue;

  let modified = false;

  // Add import if not present and we know we'll replace something
  const importStatement = "import { getImageUrl } from '@/utils/getImageUrl';\n"; 
  // Let's use relative path finding or just absolute alias if they have it, but they might not.
  // We'll calculate relative path to src/utils/getImageUrl
  const relativePathToSrc = path.relative(path.dirname(file), path.join(srcDir, 'utils', 'getImageUrl'));
  // Ensure it starts with ./ or ../
  const importPath = relativePathToSrc.startsWith('.') ? relativePathToSrc : `./${relativePathToSrc}`;
  const customImport = `import { getImageUrl } from '${importPath.replace(/\\/g, '/')}';\n`;

  if (!content.includes('getImageUrl') && /['"]\/images\/[^'"]+['"]/.test(content)) {
    // insert after other imports or at top
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + customImport + content.slice(endOfLine + 1);
    } else {
      content = customImport + content;
    }
  }

  // Replace all instances of "/images/filename.ext" with getImageUrl('filename.ext')
  // We need to handle JSX props: src="/images/x.png" -> src={getImageUrl('x.png')}
  content = content.replace(/src=(['"])\/images\/([^'"]+)\1/g, (match, quote, filename) => {
    modified = true;
    return `src={getImageUrl('${filename}')}`;
  });

  // Handle standard string assignments or JSON-like properties: image: '/images/x.png' -> image: getImageUrl('x.png')
  content = content.replace(/:\s*(['"])\/images\/([^'"]+)\1/g, (match, quote, filename) => {
    modified = true;
    return `: getImageUrl('${filename}')`;
  });

  // Handle background images in objects: backgroundImage: `url('/images/x.png')` -> backgroundImage: `url(${getImageUrl('x.png')})`
  // Too complex for simple regex, we'll skip complex template literals for now and just handle the main ones.

  if (modified) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Refactored: ${path.relative(srcDir, file)}`);
    changedFiles++;
  }
}

console.log(`Done! Refactored ${changedFiles} files.`);
