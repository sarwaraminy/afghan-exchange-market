const fs = require('fs');
const data = fs.readFileSync(0, 'utf8');
const json = JSON.parse(data);
const byProvince = {};
json.data.forEach(d => {
  if (!byProvince[d.province_name]) byProvince[d.province_name] = [];
  byProvince[d.province_name].push(d.name);
});
console.log('\n=== Districts by Province ===');
Object.keys(byProvince).sort().forEach(p => {
  console.log(p + ': ' + byProvince[p].length + ' districts');
  const dups = byProvince[p].filter((item, index) => byProvince[p].indexOf(item) !== index);
  if (dups.length > 0) {
    console.log('  DUPLICATES: ' + [...new Set(dups)].join(', '));
  }
});
console.log('\nTotal unique districts:', Object.values(byProvince).reduce((sum, arr) => sum + new Set(arr).size, 0));
console.log('Total district entries:', json.data.length);
