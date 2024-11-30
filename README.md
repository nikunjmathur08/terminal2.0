# Terminal 2.0

## Description

Terminal 2.0 is a flexible Node.js command-line application that allows you to quickly open websites, applications, files, and folders from a single interface. It provides an intuitive way to interact with your computer's resources with easy-to-use commands.

## Features

- Open websites by URL or domain name
- Launch applications by name
- Open files and folders using file paths
- Open files with specific applications
- View real-time system information (CPU usage, RAM usage, network speed)
- Tab completion for installed applications
- Comprehensive help menu

## Prerequisites

- Node.js (version 14 or higher)
- macOS (the script uses macOS-specific commands)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nikunjmathur08/terminal2.0.git
   cd terminal2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the script with Node.js:
```bash
node terminal.js
```

### Supported Commands

1. Open a website:
   - Full URL: `https://example.com`
   - Domain: `example.com`

2. Open an application:
   - By name: `Spotify`

3. Open a file or folder:
   - Absolute path: `/path/to/myFile.txt`
   - Relative path: `./myDocument.pdf`

4. Open a file with a specific application:
   - `open myImage.png with Preview`

5. View system information:
   - `sys info`

6. Get help:
   - `help` or `?`

7. Exit the application:
   - `exit`

### Tab Completion

The application supports tab completion for installed applications. Start typing an application name and press Tab to autocomplete.

## System Requirements

- Designed for macOS
- Requires Node.js
- Needs access to `/Applications` directory for listing installed apps

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Disclaimer

This script is designed for macOS and uses macOS-specific commands. Some functionalities may not work on other operating systems.

## Contact

Nikunj Mathur - https://github.com/nikunjmathur08

Project Link: [https://github.com/nikunjmathur08/terminal2.0](https://github.com/nikunjmathur08/terminal2.0)