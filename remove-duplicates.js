const fs = require('fs');

const filePath = './repo.altstore.json';

try {
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

  // Function to get letter suffix from count: 1 -> a, 2 -> b, 3 -> c ...
  function getLetterSuffix(count) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[count - 1] || ''; // fallback empty string if count > 26
  }

  // For each app, uniquify versions by appending letters on duplicates
  dedupedApps.forEach(app => {
    if (Array.isArray(app.versions)) {
      const seenVersions = new Map();
      app.versions = app.versions.map(versionObj => {
        let version = versionObj.version;
        if (seenVersions.has(version)) {
          const count = seenVersions.get(version) + 1;
          seenVersions.set(version, count);
          const suffix = getLetterSuffix(count);
          versionObj.version = `${version}${suffix}`;
        } else {
          seenVersions.set(version, 0);
        }
        return versionObj;
      });
    }
  });

  data.apps = dedupedApps;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Duplicates removed and versions uniquified with letters.');

} catch (error) {
  console.error('Error processing JSON file:', error);
  process.exit(1);
}
