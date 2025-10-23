# GitLab Extension Testing Guide

## Quick Testing Steps

### 1. Load the Updated Extension

1. Open Chrome and go to `chrome://extensions/`
2. Find "PRs-AI" extension
3. Click the refresh button to reload it
4. Make sure it's enabled

### 2. Grant Permissions for Custom GitLab

Since you're using a custom GitLab domain, the extension will use **programmatic injection**:

1. Visit your GitLab MR page (e.g., `https://gitlab.yourcompany.com/project/repo/-/merge_requests/123/edit`)
2. The extension should automatically detect it's a GitLab instance and inject the content script
3. Check the browser console for injection logs
4. **If button doesn't appear**: Click the extension icon to manually trigger injection

### 3. Expected Behavior

**For gitlab.com and \*.gitlab.com:** Content script loads automatically via manifest
**For custom GitLab instances:** Background script detects the page and injects the content script

### 4. Common GitLab Domains

The extension works on:
- `gitlab.com` (official) - **Automatic**
- `company.gitlab.com` (GitLab.com groups) - **Automatic**  
- `gitlab.company.com` (self-hosted) - **Background Detection**
- `gitlab.enosta.com` (custom domains) - **Background Detection**
- Other domains via background script detection

### 5. Open Browser Console

1. Press F12 or right-click → Inspect
2. Go to the Console tab
3. Look for PRs-AI log messages

### 6. Expected Console Output

You should see logs like:

```
PRs-AI: Injecting content script into custom GitLab instance: gitlab.yourcompany.com
PRs-AI: Content script loaded
PRs-AI: Platform detection: {hostname: "gitlab.yourcompany.com", pathname: "/project/repo/-/merge_requests/123/edit"}
PRs-AI: Detected GitLab platform
PRs-AI: Initializing... {detectedPlatform: "gitlab", ...}
PRs-AI: isPRPage check: {platform: "gitlab", ...}
PRs-AI: GitLab MR page check: {patternResults: {...}, isGitLabMRPage: true}
```

### 7. Troubleshooting

If the button doesn't appear:

1. Check console for error messages
2. Verify platform detection: `PRsAIDebug.platform` should return "gitlab"
3. Verify page detection: `PRsAIDebug.isPRPage()` should return true
4. Check form elements: `PRsAIDebug.checkElements()` should find title and description fields
5. Try force init: `PRsAIDebug.forceInit()`

### 8. Common Issues

**Content script not loading:**

- Extension might not have permission for the domain
- Check manifest.json includes the domain pattern

**Platform not detected as GitLab:**

- Should detect because hostname contains "gitlab"
- Check console logs for platform detection

**Form elements not found:**

- GitLab might use different selectors
- Run `PRsAIDebug.testSelectors()` to see which selectors work
- We can add more selectors if needed

## Manual Element Testing

If debugging shows elements aren't found, try this in console:

```javascript
// Test individual selectors
document.querySelector('#merge_request_title');
document.querySelector('input[name="merge_request[title]"]');
document.querySelector('input[data-qa-selector="issuable_form_title_field"]');

document.querySelector('#merge_request_description');
document.querySelector('textarea[name="merge_request[description]"]');
document.querySelector(
  'textarea[data-qa-selector="issuable_form_description_field"]',
);
```

Let me know what you see in the console and I can help debug further!
