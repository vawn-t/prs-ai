# PRs-AI Installation Guide

## Quick Start

Your PRs-AI Chrome extension has been successfully built! Follow these steps to install and start using it:

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** by toggling the switch in the top-right corner
3. Click the **"Load unpacked"** button
4. Navigate to your project folder and select the `dist` directory
5. The PRs-AI extension should now appear in your extensions list

### 2. Initial Setup

1. Click on the PRs-AI icon in your Chrome toolbar (or access via the puzzle piece icon)
2. Click **"Open Settings"** to configure your API keys
3. Add your API keys:
   - **OpenAI**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Gemini**: Get from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
4. Test your API keys by clicking the **"Test"** buttons
5. Customize your generation rules as desired
6. Click **"Save Settings"**

### 3. Using the Extension

1. Navigate to any GitHub repository
2. Go to create a new Pull Request or edit an existing one
3. You'll see the **"Generate with AI"** button near the PR description
4. Click it to automatically generate a professional PR title and description
5. Use **"Regenerate"** if you want different content

## Features You Can Use

✅ **Smart Analysis**: Analyzes your code changes, file modifications, and commit messages  
✅ **Multiple AI Providers**: Works with both OpenAI and Google Gemini  
✅ **Customizable Rules**: Configure title formats, description sections, and content length  
✅ **Template Integration**: Respects existing PR templates in your repositories  
✅ **Professional Output**: Generates industry-standard PR descriptions

## Development Commands

If you want to modify the extension:

```bash
# Development build with auto-reload
npm run dev

# Production build
npm run build

# Package for distribution
npm run package

# Clean build files
npm run clean
```

## Troubleshooting

**Extension not appearing?**

- Make sure Developer mode is enabled in `chrome://extensions/`
- Try refreshing the extensions page
- Check that you selected the `dist` folder, not the project root

**API keys not working?**

- Verify your keys are correctly copied (no extra spaces)
- Check that your OpenAI/Gemini accounts have sufficient credits
- Try testing one provider at a time

**Generate button not showing?**

- Make sure you're on a GitHub PR creation or edit page
- Try refreshing the page
- Check the Chrome console for any errors

## Need Help?

- Check the main README.md for detailed documentation
- Open an issue on the project repository
- Review the console logs in Chrome DevTools for debugging

---

**Enjoy using PRs-AI to create better Pull Requests! 🚀**
