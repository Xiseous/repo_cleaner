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

  // Deduplicate apps by bundleIdentifier
  const seenApps = new Set();
  const dedupedApps = data.apps.filter(app => {
    if (seenApps.has(app.bundleIdentifier)) {
      return false;
    } else {
      seenApps.add(app.bundleIdentifier);
      return true;
    }
  });

  // For each app's versions, deduplicate version strings by appending .1, .2, etc.
  dedupedApps.forEach(app => {
    if (Array.isArray(app.versions)) {
      const seenVersions = new Map(); // version string -> count
      app.versions = app.versions.map(versionObj => {
        let version = versionObj.version;
        if (seenVersions.has(version)) {
          // Increment count and append to version string for uniqueness
          const count = seenVersions.get(version) + 1;
          seenVersions.set(version, count);
          versionObj.version = `${version}.${count}`;
        } else {
          seenVersions.set(version, 0);
        }
        return versionObj;
      });
    }
  });

  data.apps = dedupedApps;

  // Write back formatted JSON
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Duplicates removed and versions uniquified successfully.');

} catch (error) {
  console.error('Error processing JSON file:', error);
  process.exit(1);
}
