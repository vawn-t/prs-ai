# PRs-AI 🤖

An AI-powered Chrome extension that generates professional Pull Request descriptions and titles based on your code changes. Supports both OpenAI (ChatGPT) and Google Gemini APIs.

## Features

🚀 **Smart PR Generation**: Automatically generates PR titles and descriptions based on:

- File changes and diff statistics
- Commit messages
- Existing PR templates
- Configurable rules and preferences

🔑 **Multiple AI Providers**:

- OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo)
- Google Gemini (Gemini Pro, Gemini Pro Vision)

⚙️ **Customizable Rules**:

- Title formats (Conventional Commits, Descriptive, Custom)
- Description sections (Summary, Changes, Testing, Breaking Changes) or custom templates
- Content length limits
- Template integration

🎨 **Clean UI**: Modern, GitHub-integrated interface that feels native to the platform

## Installation

### From Source

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd prs-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Package for Distribution

To create a distributable .zip file:

```bash
npm run package
```

This creates `prs-ai-extension.zip` in the project root.

## Setup

### Getting API Keys

**OpenAI (ChatGPT):**

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it in the extension settings

**Google Gemini:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the key and add it in the extension settings

### Configuration

1. After installation, the extension will open the settings page
2. Add your API keys for OpenAI and/or Gemini
3. Test the API keys to ensure they work
4. Customize generation rules to match your preferences
5. Save settings

## Usage

1. **Navigate to a GitHub PR creation page**:

   - Creating a new PR from a branch comparison
   - Opening an existing PR for editing

2. **Generate content**:

   - Click the "Generate with AI" button near the PR description
   - The extension will analyze code changes and generate appropriate content
   - Review and modify the generated title and description as needed

3. **Regenerate if needed**:
   - Use the "Regenerate" button to get alternative content
   - Adjust settings for different results

## Development

### Project Structure

```
src/
├── background/     # Service worker
├── content/        # GitHub page integration
├── popup/          # Extension popup UI
├── options/        # Settings page
└── shared/         # Common utilities and types
```

### Development Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Clean build directory
npm run clean

# Package for distribution
npm run package
```

### Technologies Used

- **TypeScript** - Type-safe development
- **React** - UI components
- **Webpack** - Bundling and building
- **Chrome Extensions Manifest V3** - Modern extension architecture

## Features in Detail

### AI Integration

- Validates API keys before use
- Fallback between providers (tries OpenAI first, then Gemini)
- Configurable models for each provider
- Error handling and user feedback

### GitHub Integration

- Detects PR creation and edit pages
- Extracts file changes, commit messages, and existing templates
- Preserves existing PR template structure
- Non-intrusive UI that matches GitHub's design

### Customization Options

- **Title Formats**: Conventional Commits, descriptive, or custom templates
- **Content Sections**: Choose which sections to include in descriptions
- **Analysis Scope**: Include/exclude file changes and commit messages
- **Length Limits**: Configure maximum description length

## Privacy & Security

- API keys are stored locally in Chrome's sync storage
- No data is sent to external servers except AI providers
- All communication uses HTTPS
- Open source - audit the code yourself

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please:

- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed information about your setup

---

**Note**: This extension requires API keys from OpenAI and/or Google to function. Free tier limits may apply depending on your API provider.
