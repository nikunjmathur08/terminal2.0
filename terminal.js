import { exec } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

// Create an interface to read input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get CPU usage
function getCpuUsage() {
    const cpus = os.cpus();
    const total = cpus.length;
    const user = cpus.reduce((acc, cpu) => acc + cpu.times.user, 0);
    const nice = cpus.reduce((acc, cpu) => acc + cpu.times.nice, 0);
    const sys = cpus.reduce((acc, cpu) => acc + cpu.times.sys, 0);
    const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const irq = cpus.reduce((acc, cpu) => acc + cpu.times.irq, 0);

    const totalUsage = user + nice + sys + irq;
    const totalTime = totalUsage + idle;

    return (totalUsage / totalTime) * 100;
}

// Function to get RAM usage
function getRamUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
        total: (totalMemory / 1024 / 1024).toFixed(2), // MB
        used: (usedMemory / 1024 / 1024).toFixed(2), // MB
        free: (freeMemory / 1024 / 1024).toFixed(2) // MB
    };
}

// Function to get network speed using a reliable URL
async function getNetworkSpeed() {
    const url = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png';
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error('Failed to get the file'));
            }

            let dataLength = 0;

            response.on('data', (chunk) => {
                dataLength += chunk.length;
            });

            response.on('end', () => {
                const durationInSeconds = (Date.now() - startTime) / 1000;
                const speedInMbps = ((dataLength * 8) / (1024 * 1024) / durationInSeconds).toFixed(2);
                resolve(speedInMbps);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to display system information
async function displaySystemInfo() {
    const cpuUsage = getCpuUsage();
    const ramUsage = getRamUsage();
    let networkSpeed;

    try {
        networkSpeed = await getNetworkSpeed();
    } catch (err) {
        console.error('Error fetching network speed:', err.message);
        networkSpeed = 'N/A';
    }

    console.log(`\nCurrent CPU Usage: ${cpuUsage.toFixed(2)}%`);
    console.log(`Current RAM Usage: ${ramUsage.used} MB used / ${ramUsage.total} MB total`);
    console.log(`Current Network Speed: ${networkSpeed} Mbps\n`);
}

// Function to check if a command is a valid file/folder path
function isValidPath(command) {
    return new Promise((resolve) => {
        const fullPath = path.resolve(command);
        fs.access(fullPath, fs.constants.F_OK, (err) => {
            resolve(!err);
        });
    });
}

// Function to get a list of installed applications
function getInstalledApplications() {
    const appDirectory = '/Applications';
    return fs.readdirSync(appDirectory).filter(file => file.endsWith('.app')).map(file => file.replace('.app', ''));
}

// Setup tab completion
const applications = getInstalledApplications();
const completer = (line) => {
    const hits = applications.filter(app => app.toLowerCase().startsWith(line.toLowerCase()));
    return [hits.length ? hits : applications, line];
};

// Function to log memory allocated to process
function logProcessMemory(pid, message) {
    const memoryUsage = process.memoryUsage();
    const memoryAllocated = (memoryUsage.rss / 1024 / 1024).toFixed(2); // Convert from bytes to MB
    console.log(`Process ${pid} - ${message}: Allocated Memory - ${memoryAllocated} MB`);
}

// Function to execute commands with child processes and log memory usage
function executeCommand(command) {
    const child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
        } else if (stderr) {
            console.error(`Error output: ${stderr}`);
        } else {
            console.log(`Command executed successfully.`);
        }
        logProcessMemory(child.pid, "Process ended");
    });

    logProcessMemory(child.pid, "Child process created");
    console.log(`Process ${child.pid} started: Command - "${command}"`);

    child.on('exit', (code) => {
        console.log(`Process ${child.pid} ended with exit code ${code}`);
    });
}

// Function to display help instructions
function displayHelp() {
    console.log(`
Available Commands:
1. Open a website: Type a full URL or a domain name (e.g., 'https://example.com' or 'example.com').
2. Open an application: Type the name of the application (e.g., 'Spotify').
3. Open a file or folder: Type the path to the file or folder (e.g., '/path/to/myFile.txt').
4. Open a file with a specific application: Type 'open filename with ApplicationName' (e.g., 'open myImage.png with Preview').
5. View system information: Type 'sys info' to display current CPU usage, RAM usage, and network speed.
6. Help: Type 'help' or '?' to display this help message.
7. Exit: Type 'exit' to close the script.
`);
}

// Function to parse and execute the command
async function parseAndExecuteCommand(input) {
    const command = input.trim();

    if (command.toLowerCase() === 'exit') {
        rl.close();
        return;
    }

    if (command.toLowerCase() === 'help' || command === '?') {
        displayHelp();
        return;
    }

    if (command.toLowerCase() === 'sys info') {
        await displaySystemInfo();
        return;
    }

    const openWithMatch = command.match(/open (.+) with (.+)/);
    if (openWithMatch) {
        const fileToOpen = openWithMatch[1].trim();
        const appToUse = openWithMatch[2].trim();
        const fullPath = path.resolve(fileToOpen);

        const isFileValid = await isValidPath(fullPath);
        if (!isFileValid) {
            console.error(`Error: The file "${fileToOpen}" does not exist.`);
            return;
        }

        executeCommand(`open -a "${appToUse}" "${fullPath}"`);
        return;
    }

    const isURL = command.startsWith('http://') || command.startsWith('https://');
    const hasDomain = command.match(/\.\w+$/) && !command.includes(' ');

    if (isURL) {
        executeCommand(`open "${command}"`);
    } else if (hasDomain) {
        executeCommand(`open "https://${command}"`);
    } else {
        const fullPath = path.resolve(command);
        const isFileOrFolder = await isValidPath(fullPath);

        if (isFileOrFolder) {
            executeCommand(`open "${fullPath}"`);
        } else {
            const appName = command.charAt(0).toUpperCase() + command.slice(1);
            if (applications.includes(appName)) {
                executeCommand(`open -a "${appName}"`);
            } else {
                console.error(`Error: The application "${appName}" is not found.`);
            }
        }
    }
}

// Handle output from exec function
function handleOutput(error, stdout, stderr) {
    if (error) {
        console.error(`Error executing command: ${error.message}`);
    } else if (stderr) {
        console.error(`Error output: ${stderr}`);
    } else {
        console.log(`Command executed successfully.`);
    }
}

// Prompt user and set up tab completion
rl.setPrompt('What would you like to open (website, application, file, or folder)? ');
rl.prompt();

rl.on('line', async (input) => {
    await parseAndExecuteCommand(input);
    rl.prompt();
}).on('close', () => {
    console.log('Exiting program...');
    process.exit(0);
});

// Enable tab completion
rl.completer = completer;

rl.input.on('keypress', (char, key) => {
    if (key.name === 'tab') {
        const line = rl.line;
        const completions = completer(line)[0];

        if (completions.length > 0) {
            const match = completions[0];
            rl.line += match.substring(line.length) + ' ';
            rl.cursor += match.length - line.length + 1;
            rl.prompt();
        }
    }
});
