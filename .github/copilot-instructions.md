# Copilot Instructions for PRs-AI Chrome Extension

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Chrome Extension project for generating AI-powered GitHub PR descriptions and titles.

## Project Context

**Technology Stack:**

- Chrome Extension Manifest V3
- TypeScript
- React for UI components
- Webpack for bundling
- Chrome APIs for storage and content scripts

**Key Components:**

- Background service worker for API management
- Content scripts for GitHub page integration
- Popup for quick settings access
- Options page for comprehensive configuration
- AI service integration (OpenAI and Google Gemini)

**Architecture:**

- `src/shared/` - Common types, utilities, and services
- `src/background/` - Service worker for Chrome extension
- `src/content/` - Scripts injected into GitHub pages
- `src/popup/` - Quick settings popup UI
- `src/options/` - Full settings page UI

**Code Style Guidelines:**

- Use TypeScript strict mode
- Prefer functional React components with hooks
- Use Chrome extension APIs properly (chrome.storage, chrome.runtime)
- Handle errors gracefully with user-friendly messages
- Follow Chrome extension security best practices
- Use proper accessibility attributes (aria-labels, semantic HTML)

**AI Integration:**

- Support multiple AI providers (OpenAI, Gemini)
- Validate API keys before use
- Implement fallback between providers
- Parse structured responses from AI APIs
- Handle rate limits and API errors

**GitHub Integration:**

- Detect PR creation/edit pages using URL patterns
- Extract file changes, commit messages, and existing templates
- Inject UI elements that match GitHub's design system
- Handle GitHub's SPA navigation with mutation observers

**Security Considerations:**

- Store sensitive data (API keys) in Chrome sync storage
- Use proper content security policy
- Validate all user inputs
- Follow principle of least privilege for permissions

When working on this project, prioritize:

1. User experience and accessibility
2. Security and privacy protection
3. Reliable AI integration
4. Clean, maintainable code
5. Error handling and user feedback
