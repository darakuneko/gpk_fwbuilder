# GPK FWBuilder

<div align="center">

**A desktop application for building QMK and Vial keyboard firmware with ease**

[![Release](https://img.shields.io/github/v/release/darakuneko/gpk_fwbuilder)](https://github.com/darakuneko/gpk_fwbuilder/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/darakuneko/gpk_fwbuilder)

**English | [日本語](README_ja.md)**

</div>

## Overview

GPK FWBuilder is a user-friendly desktop application that simplifies the process of building custom mechanical keyboard firmware. It provides a graphical interface for QMK and Vial firmware compilation, eliminating the need for command-line knowledge.

https://github.com/user-attachments/assets/dcf499e6-8604-40dd-981c-61882ef3df7e

## Features

### Build Firmware
- Support for both **QMK** and **Vial** firmware
- Easy keyboard and keymap selection from dropdown menus
- Tag/commit-based builds for version control
- Support for up to 5 custom QMK/Vial fork repositories
- Real-time build logs with side panel view
- Automatic firmware output to `~/GPKFW/` directory

### Generate Files
- **QMK Keyboard Files**: Generate template keyboard configuration files
  - Create info.json, rules.mk, config.h, and keymap files
  - Support for various MCU types
  - Customizable keyboard name and author
- **Vial Unique ID**: Create unique identifiers for Vial-enabled keyboards
  - Generate 8-byte unique ID required for Vial

### Convert Tools
- **Vial to Keymap.c**: Convert Vial JSON files to QMK keymap.c format
  - Import .vil files exported from Vial
  - Automatic keymap generation
- **KLE to Keyboard**: Transform KLE (Keyboard Layout Editor) JSON files into QMK/Vial keyboard files
　- Base on [zykrah/firmware-scripts](https://github.com/zykrah/firmware-scripts) 

### Settings
- **Repository Management**: 
  - Configure and update custom firmware repositories
  - Support for GitHub URLs
- **Docker Image**: 
  - Rebuild and manage the Docker build environment
- **External Server**: 
  - Configure external GPK FWMaker server for remote builds
- **Update Notifications**: 
  - View update history
- **Language Support**: 
  - English and Japanese (日本語) interfaces

## System Requirements

### Prerequisites
Install Docker Desktop from https://www.docker.com  
*Note: Any Docker-compatible environment that supports docker compose will work*

## Getting Started

### 1. Initial Setup
- Launch GPK FWBuilder
- The application will initialize the Docker environment on first run
- This may take several minutes as it downloads the build image
- You can skip Docker check if needed (not recommended)

### 2. Building Firmware

1. **Select Firmware Type**
   - Choose between QMK or Vial from the dropdown
   - The keyboard list will update based on your selection

2. **Select Keyboard**
   - Choose your target keyboard from the list
   - Use the search feature for faster navigation
   - Copy keyboard files to local if needed

3. **Select Keymap**
   - Choose from available keymaps
   - Default keymap is usually a good starting point

4. **Configure Build Options** (Optional)
   - Select specific tag or commit
   - Choose custom repository if using forks

5. **Build**
   - Click the "Build" button
   - Monitor progress in the logs panel
   - Firmware will be saved to `~/GPKFW/`

### 3. File Locations

- **Firmware Output**: `~/GPKFW/`
- **Keyboard Files**: Copy custom keyboards to `~/GPKFW/keyboards/`
- **Build Logs**: Displayed in the application

## Advanced Features

### Custom Repositories
You can add up to 5 fork repositories each for QMK and Vial:
1. Go to Settings → Repository
2. Enter the GitHub repository URL
3. Click Update to sync

### KLE to Keyboard Conversion
1. Create your layout in [Keyboard Layout Editor](http://www.keyboard-layout-editor.com/)
2. Export the JSON file
3. Use Convert → KLE to Keyboard File
4. Configure matrix settings and generate files

![KLE Guidelines](https://user-images.githubusercontent.com/5214078/212449850-e3fb4a3b-211d-4841-9128-7072bb05c7da.png)

### Via.json Generation
Generate Via configuration files from QMK info.json and KLE layouts:
1. Select your info.json file
2. Select your KLE layout file  
3. Generate via.json for VIA configurator compatibility

## Troubleshooting

### Docker Connection Issues
- Ensure Docker Desktop is running before launching the app
- Check Docker Desktop settings for resource allocation
- On Windows, ensure Hyper-V is enabled
- Try rebuilding the Docker image from Settings → Image

### Build Failures
- Check the build logs for specific error messages
- Ensure keyboard and keymap names are correct
- Verify the repository is up to date
- Check for sufficient disk space

### Missing Keyboards
- Click "Refresh" to update the keyboard list
- Update repositories from Settings → Repository
- Verify the keyboard exists in the selected firmware type

## Development

### Development Setup
```bash
# Clone the repository
git clone https://github.com/darakuneko/gpk_fwbuilder.git
cd gpk_fwbuilder

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start Electron
npm run start
```

### Building from Source
```bash
# Build for all platforms
npm run build

# Platform-specific builds
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## Related Projects

- **CUI Version**: [GPK FWMaker](https://github.com/darakuneko/gpk_fwmaker) - Command-line version
- **Firmware Scripts**: Based on [zykrah/firmware-scripts](https://github.com/zykrah/firmware-scripts)
- **Vial2C**: Uses [ymkn/vial2c](http://ymkn.github.io/vial2c/) for Vial conversions

## Developer Support

**Buy me a coffee**  
[Amazon Wishlist](https://www.amazon.co.jp/hz/wishlist/ls/66VQJTRHISQT) | [Ko-fi](https://ko-fi.com/darakuneko)

## License

This project is released under the [MIT License](LICENSE).

---

<div align="center">

**GPK FWBuilder - Making QMK/Vial firmware generation easier**

Made with ❤ by [darakuneko](https://github.com/darakuneko)

</div>
