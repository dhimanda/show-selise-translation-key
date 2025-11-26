# Selise Translation Key Extension

A Chrome extension that blocks translation file requests to show translation keys instead of translated text on Selise applications.

<img width="1373" height="831" alt="Extension Preview" src="https://github.com/user-attachments/assets/93896094-9772-4999-943d-95865420ff99" />

## Features

- Toggle translation file blocking on/off
- Blocks translation requests from two API endpoints:
  - `/api/uilm/v*/LanguageManager/Query/GetUilmFile`
  - `/uilm/v*/Key/GetUilmFile`
- Simple popup interface with enable/disable toggle

## Installation in Chrome

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/dhimanda/show-selise-translation-key.git
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked" button
   - Navigate to and select the `Translation-Show` folder from this repository

5. **Verify installation**
   - The extension should now appear in your extensions list
   - You'll see the extension icon in your Chrome toolbar

6. **Pin the extension (optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Selise Translation Key" and click the pin icon

## Usage

1. Click the extension icon in your Chrome toolbar
2. Toggle the switch to enable/disable translation blocking
3. Refresh the Selise application page to see the changes
4. When enabled, you'll see translation keys instead of translated text

## How It Works

The extension uses Chrome's `declarativeNetRequest` API to intercept and block network requests to translation file endpoints. When blocked, the application falls back to displaying translation keys.

## Permissions Required

- `declarativeNetRequest`: To block translation file requests
- `declarativeNetRequestWithHostAccess`: To access specific hosts
- `storage`: To persist the enabled/disabled state

## Development

To modify the extension:

1. Edit files in the `Translation-Show` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT
