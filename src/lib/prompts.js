import readline from 'readline';
import chalk from './colors.js';

let rl;

const getRl = () => {
    if (!rl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    return rl;
};

const ask = (query) => {
    return new Promise((resolve) => getRl().question(query, resolve));
};

const processQuestion = async (question) => {
    let answer;
    const { type, name, message, default: defaultVal, choices, validate, filter } = question;

    const displayMessage = `${message}${defaultVal !== undefined ? ` (default: ${type === 'confirm' ? (defaultVal ? 'Yes' : 'No') : defaultVal})` : ''} `;

    if (type === 'confirm') {
        while (true) {
            const input = await ask(`${chalk.green('?')} ${chalk.bold(displayMessage)} (y/N) `);
            const trimmed = input.trim().toLowerCase();
            if (trimmed === '') {
                answer = defaultVal !== undefined ? defaultVal : false;
                break;
            }
            if (trimmed === 'y' || trimmed === 'yes') {
                answer = true;
                break;
            }
            if (trimmed === 'n' || trimmed === 'no') {
                answer = false;
                break;
            }
        }
    } else if (type === 'list') {
        console.log(`${chalk.green('?')} ${chalk.bold(message)}`);
        choices.forEach((choice, index) => {
            console.log(`  ${index + 1}) ${choice}`);
        });

        while (true) {
            const input = await ask(`  ${chalk.dim('Answer:')} `);
            const trimmed = input.trim();

            // Handle empty input if default exists
            if (trimmed === '' && defaultVal) {
                // defaultVal might be the value string, finding its index
                const defaultIndex = choices.indexOf(defaultVal);
                if (defaultIndex !== -1) {
                    answer = defaultVal;
                    break;
                }
            }

            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num > 0 && num <= choices.length) {
                answer = choices[num - 1];
                break;
            }
            console.log(chalk.red(`  Please enter a number between 1 and ${choices.length}`));
        }

    } else {
        // type === 'input' or default
        while (true) {
            const input = await ask(`${chalk.green('?')} ${chalk.bold(displayMessage)}`);
            let val = input.trim();

            if (val === '' && defaultVal !== undefined) {
                val = defaultVal;
            }

            if (filter) {
                val = filter(val);
            }

            const validated = validate ? validate(val) : true;
            if (validated === true) {
                answer = val;
                break;
            } else {
                console.log(typeof validated === 'string' ? validated : chalk.red('Invalid input'));
            }
        }
    }

    return { [name]: answer };
};

const prompt = async (questions) => {
    const answers = {};
    for (const question of questions) {
        const answer = await processQuestion(question);
        Object.assign(answers, answer);
    }
    return answers;
};

const close = () => {
    if (rl) {
        rl.close();
        rl = null;
    }
};

export default {
    prompt,
    close
};
