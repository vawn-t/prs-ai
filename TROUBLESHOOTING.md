# PRs-AI Troubleshooting Guide

If you're not seeing the "Generate with AI" button, follow these debugging steps:

## 1. Check Extension Installation

1. Go to `chrome://extensions/`
2. Make sure **PRs-AI** is listed and **enabled**
3. Make sure **Developer mode** is turned on
4. Click the **reload button** (circular arrow) on the PRs-AI extension

## 2. Verify You're on the Right Page

The extension only works on GitHub PR creation and edit pages:

✅ **Supported URLs:**

- `github.com/user/repo/compare/branch1...branch2`
- `github.com/user/repo/pull/new`
- `github.com/user/repo/pull/123/edit`
- `github.com/user/repo/compare`

❌ **NOT supported:**

- GitHub homepage
- Repository main page
- Issues pages
- Already-created PR view pages (unless editing)

## 3. Check Console for Debug Messages

1. Open Chrome DevTools (F12 or right-click → Inspect)
2. Go to the **Console** tab
3. Refresh the GitHub page
4. Look for messages starting with `PRs-AI:`

**Expected messages:**

```
PRs-AI: Content script loaded
PRs-AI: Initializing...
PRs-AI: isPRPage check: {url: "...", pathname: "...", isPRPage: true}
PRs-AI: Loading config...
PRs-AI: Injecting UI...
PRs-AI: Found elements: {titleInput: true, descriptionTextarea: true}
PRs-AI: Creating generate button...
PRs-AI: Button successfully inserted
```

## 4. Manual Button Injection Test

If the button still doesn't appear, try this in the console:

```javascript
// Test if extension is working
console.log('Testing PRs-AI button injection...');

// Create test button
const testButton = document.createElement('div');
testButton.innerHTML =
  '<button style="background: green; color: white; padding: 10px; margin: 10px;">TEST: PRs-AI Button</button>';
testButton.style.border = '2px solid red';

// Try to find textarea and insert button
const textarea = document.querySelector('textarea');
if (textarea) {
  textarea.parentNode.insertBefore(testButton, textarea.nextSibling);
  console.log('Test button inserted successfully');
} else {
  console.log('No textarea found on this page');
}
```

## 5. Check for GitHub UI Changes

GitHub frequently updates their UI. If the extension stops working:

1. **Right-click** on the PR description textarea
2. **Inspect Element**
3. Look for the `id` or `name` attributes
4. Check if they match our selectors:
   - `#pull_request_body`
   - `[name="pull_request[body]"]`
   - `textarea[placeholder*="description"]`
   - `.js-comment-field-input`
   - `textarea.form-control`

## 6. Force Reload Extension

1. Go to `chrome://extensions/`
2. Find **PRs-AI**
3. Click **Remove**
4. Click **Load unpacked** again
5. Select the `dist` folder

## 7. Check Permissions

Make sure the extension has permission to access GitHub:

1. Click the PRs-AI icon in Chrome toolbar
2. If you see permission warnings, click to grant them
3. The extension needs access to `github.com`

## 8. Test on Different PR Pages

Try these different scenarios:

- Create a new branch and start a PR
- Edit an existing PR
- Compare two branches
- Different repositories (public vs private)

## 9. Check for Content Security Policy Issues

Some corporate networks block content scripts. Check console for CSP errors:

- Look for "Content Security Policy" errors
- Look for "chrome-extension://" blocked messages

## 10. Report Issues

If none of these steps work:

1. **Collect information:**

   - Chrome version
   - GitHub page URL
   - Console error messages
   - Screenshots

2. **Create an issue** with all the debugging information

## Quick Test Page

Try the extension on this test repository:
https://github.com/octocat/Hello-World/compare

This is a simple public repository where you can test the PR creation flow.

---

**Most Common Issues:**

1. ✅ Extension not enabled
2. ✅ Wrong GitHub page type
3. ✅ Need to reload extension after installation
4. ✅ GitHub UI selectors have changed
