import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  "C:\\Users\\LENOVO\\OneDrive\\Desktop\\projects\\hospital-surgoen\\hospital-surgeons\\app\\admin\\_components",
);

const pattern = /"([^"]+?)@\d+\.\d+\.\d+"/g;

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      const content = fs.readFileSync(fullPath, "utf8");
      const updated = content.replace(pattern, (_, pkg) => `"${pkg}"`);
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, "utf8");
      }
    }
  }
}

walk(root);
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  "C:\\Users\\LENOVO\\OneDrive\\Desktop\\projects\\hospital-surgoen\\hospital-surgeons\\app\\admin\\_components",
);

const pattern = /"([^"]+?)@\d+\.\d+\.\d+"/g;

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      const content = fs.readFileSync(fullPath, "utf8");
      const updated = content.replace(pattern, (_, pkg) => `"${pkg}"`);
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, "utf8");
      }
    }
  }
}

walk(root);
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  "C:\\Users\\LENOVO\\OneDrive\\Desktop\\projects\\hospital-surgoen\\hospital-surgeons\\app\\admin\\_components",
);

const pattern = /"([^"]+?)@\d+\.\d+\.\d+"/g;

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      const updated = content.replace(pattern, (_, pkg) => `"${pkg}"`);
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, "utf8");
      }
    }
  }
}

walk(root);

