import { ESLint } from "eslint";

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const ignoredFiles = await Promise.all(
    files.map((file) => eslint.isPathIgnored(file)),
  );
  const filteredFiles = files.filter((_, i) => !ignoredFiles[i]);
  return filteredFiles.join(" ");
};

export default {
  "**/*.ts?(x)": async (filenames) => {
    const styleFix = `prettier --write ${filenames.join(" ")}`;
    const typeCheck = "tsc -p tsconfig.json --noEmit";
    const filesToLint = await removeIgnoredFiles(filenames);
    const lintCheck = `eslint --max-warnings=0 ${filesToLint}`;
    const styleCheck = `prettier --check ${filenames.join(" ")}`;
    const cmd = 'concurrently -c "auto" -n "type-check,lint-check,style-check"';
    return [styleFix, `${cmd} "${typeCheck}" "${lintCheck}" "${styleCheck}"`];
  },
  "**/*.?(s)css": (filenames) => `prettier --write ${filenames.join(" ")}`,
};
