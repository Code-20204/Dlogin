const fs = require('fs');
const path = require('path');

function checkDuplicateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const reactImports = lines.filter(line => 
      line.includes('import') && 
      line.includes('from \'react\'') &&
      (line.includes('useState') || line.includes('useEffect'))
    );
    
    console.log(`\n${filePath}:`);
    console.log(`React hook imports found: ${reactImports.length}`);
    reactImports.forEach((line, index) => {
      console.log(`  ${index + 1}: ${line.trim()}`);
    });
    
    if (reactImports.length > 1) {
      console.log('  ❌ DUPLICATE IMPORTS DETECTED!');
      return false;
    } else {
      console.log('  ✅ No duplicate imports');
      return true;
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('🔍 Checking for duplicate React hook imports...');

const filesToCheck = [
  'pages/admin/users.js',
  'pages/dashboard.js',
  'pages/index.js',
  'pages/login.js',
  'pages/email-settings.js'
];

let allGood = true;
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const result = checkDuplicateImports(fullPath);
    allGood = allGood && result;
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All files passed duplicate import check!');
  console.log('🚀 Build should now succeed');
} else {
  console.log('❌ Some files still have duplicate imports');
  console.log('🔧 Manual fixes may be needed');
}
console.log('='.repeat(50));