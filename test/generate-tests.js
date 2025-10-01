import fs from 'fs';
import path from 'path';

const indexJsPath = path.join(process.cwd(), 'index.js');
const indexJsContent = fs.readFileSync(indexJsPath, 'utf-8');

const extractedPrompts = [];

// Regex to find inquirer.prompt calls and extract the array of prompt objects
const inquirerPromptRegex = /inquirer\.prompt\(\[([\s\S]*?)\]\)/g;
let promptArrayMatch;

while ((promptArrayMatch = inquirerPromptRegex.exec(indexJsContent)) !== null) {
  const promptArrayString = promptArrayMatch[1];

  // Regex to extract individual prompt objects from the array string
  const promptObjectRegex = /{\s*type:\s*"(.*?)",\s*name:\s*"(.*?)",\s*message:\s*"(.*?)"(?:,\s*choices:\s*\[([\s\S]*?)\])?(?:,\s*default:\s*(.*?))?[\s\S]*?}/g;
  let promptMatch;

  while ((promptMatch = promptObjectRegex.exec(promptArrayString)) !== null) {
    const prompt = {
      type: promptMatch[1],
      name: promptMatch[2],
      message: promptMatch[3],
      choices: [],
      default: undefined,
    };

    // Extract choices if available
    if (promptMatch[4]) {
      prompt.choices = promptMatch[4].split(',').map(c => c.trim().replace(/['"]/g, '')).filter(c => c !== '');
    }

    // Extract default value if available
    if (promptMatch[5]) {
      const defaultValue = promptMatch[5].trim();
      if (defaultValue === 'true') {
        prompt.default = true;
      } else if (defaultValue === 'false') {
        prompt.default = false;
      } else if (defaultValue === '' || defaultValue === '""') {
        prompt.default = '';
      } else if (!isNaN(defaultValue)) { // Check if it's a number
        prompt.default = Number(defaultValue);
      } else {
        prompt.default = defaultValue.replace(/['"]/g, '');
      }
    }
    extractedPrompts.push(prompt);
  }
}

const testCases = [];

// Generate test cases based on extracted prompts
// This is a simplified approach to avoid combinatorial explosion.
// For each option, we create a test case that enables/selects that option,
// while others remain at their default or a sensible fallback.

for (const prompt of extractedPrompts) {
  // Skip projectName as it's handled separately in tests
  if (prompt.name === 'projectName') continue;

  if (prompt.type === 'confirm') {
    // Test case for enabling the option
    const enableTestCase = {
      description: `should create a project with ${prompt.name} enabled`,
      options: {},
      expectedFiles: [], // Placeholder for expected files
      assertions: () => { /* TODO: Add specific assertions for this case */ },
    };
    // Set all defaults first
    extractedPrompts.forEach(p => {
      if (p.name !== 'projectName') {
        enableTestCase.options[p.name] = p.default !== undefined ? p.default : (p.type === 'confirm' ? false : '');
      }
    });
    enableTestCase.options[prompt.name] = true;
    testCases.push(enableTestCase);

    // Test case for disabling the option (if default is true or not explicitly false)
    if (prompt.default !== false) {
      const disableTestCase = {
        description: `should create a project with ${prompt.name} disabled`,
        options: {},
        expectedFiles: [], // Placeholder for expected files
        assertions: () => { /* TODO: Add specific assertions for this case */ },
      };
      extractedPrompts.forEach(p => {
        if (p.name !== 'projectName') {
          disableTestCase.options[p.name] = p.default !== undefined ? p.default : (p.type === 'confirm' ? false : '');
        }
      });
      disableTestCase.options[prompt.name] = false;
      testCases.push(disableTestCase);
    }
  } else if (prompt.type === 'list') {
    prompt.choices.forEach(choice => {
      const listTestCase = {
        description: `should create a project with ${prompt.name} set to ${choice}`,
        options: {},
        expectedFiles: [], // Placeholder for expected files
        assertions: () => { /* TODO: Add specific assertions for this case */ },
      };
      extractedPrompts.forEach(p => {
        if (p.name !== 'projectName') {
          listTestCase.options[p.name] = p.default !== undefined ? p.default : (p.type === 'confirm' ? false : '');
        }
      });
      listTestCase.options[prompt.name] = choice;
      testCases.push(listTestCase);
    });
  } else if (prompt.type === 'input') {
    // For input types, we'll generate a test case with a default or a simple value
    const inputTestCase = {
      description: `should create a project with custom ${prompt.name}`,
      options: {},
      expectedFiles: [], // Placeholder for expected files
      assertions: () => { /* TODO: Add specific assertions for this case */ },
    };
    extractedPrompts.forEach(p => {
      if (p.name !== 'projectName') {
        inputTestCase.options[p.name] = p.default !== undefined ? p.default : (p.type === 'confirm' ? false : '');
      }
    });
    // Use a specific value for input prompts, or its default
    inputTestCase.options[prompt.name] = prompt.default || (prompt.name === 'pages' ? 'testpage' : 'custom');
    testCases.push(inputTestCase);
  }
}

const generatedTestCasesPath = path.join(process.cwd(), 'test', 'generated-test-cases.js');
const fileContent = `// This file is auto-generated by test/generate-tests.js
// Do not edit this file directly. Run 'npm run test:generate' to regenerate.

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

export const testCases = ${JSON.stringify(testCases, null, 2)};
`;
fs.writeFileSync(generatedTestCasesPath, fileContent);

console.log(`Generated ${testCases.length} test cases in ${generatedTestCasesPath}`);