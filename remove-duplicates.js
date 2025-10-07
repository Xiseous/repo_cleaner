const fs = require('fs');

const filePath = './repo.altstore.json';

try {
  // Read the JSON file
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (!Array.isArray(data.apps)) {
    console.error("Error: 'apps' field is missing or not an array.");
    process.exit(1);
  }

  // Track seen bundleIdentifiers
  const seen = new Set();

  // Filter to keep only unique bundleIdentifiers
  const dedupedApps = data.apps.filter(app => {
    if (seen.has(app.bundleIdentifier)) {
      return false; // duplicate
    } else {
      seen.add(app.bundleIdentifier);
      return true; // first occurrence
    }
  });

  // Replace apps array with deduplicated one
  data.apps = dedupedApps;

  // Write back the JSON with pretty formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  console.log('Duplicates removed successfully.');

} catch (error) {
  console.error('Error processing JSON file:', error);
  process.exit(1);
}
