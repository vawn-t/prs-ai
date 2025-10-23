# GitLab Support Documentation

## Universal GitLab Support

This extension now supports GitLab instances universally:

### ✅ Automatically Supported Domains

The extension will automatically inject on these domains:

1. **GitLab.com**
   - `https://gitlab.com/*`

2. **GitLab.com Subdomains**
   - `https://*.gitlab.com/*`
   - Example: `https://staging.gitlab.com/`

3. **GitLab Pages**
   - `https://*.gitlab.io/*`
   - Example: `https://myproject.gitlab.io/`

### 🔧 Self-Hosted GitLab Instances

For self-hosted GitLab instances with custom domains (like `gitlab.enosta.com`), the extension uses intelligent detection:

1. **Automatic Detection**: The background script detects GitLab by:
   - Hostname containing "gitlab"
   - URL patterns matching GitLab merge request paths
   - Page structure analysis

2. **Manual Activation**: If auto-detection doesn't work:
   - Click the extension icon on any GitLab page
   - The extension will inject if it detects GitLab patterns

### 🎯 Supported GitLab Pages

The extension works on these GitLab pages:

- **New Merge Request**: `/-/merge_requests/new`
- **Edit Merge Request**: `/-/merge_requests/123/edit`
- **Merge Request View**: `/-/merge_requests/123`
- **Compare Branches**: `/-/compare/branch1...branch2`

### 🔍 Detection Logic

The extension detects GitLab instances by checking:

1. **Hostname patterns**:
   - Exact match: `gitlab.com`
   - Contains: `gitlab` (e.g., `gitlab.company.com`)

2. **URL patterns**:
   - Contains: `/-/merge_requests/`
   - Contains: `/-/compare/`

3. **Page structure**:
   - GitLab-specific DOM elements
   - Merge request form inputs

### 🚀 Usage

1. **Navigate** to any GitLab merge request page
2. **Button appears** automatically with "Generate with AI"
3. **Configure** your API keys in the extension options
4. **Generate** AI-powered titles and descriptions

### 🔧 Troubleshooting

If the extension doesn't appear on your GitLab instance:

1. **Check URL**: Ensure it's a merge request or compare page
2. **Manual trigger**: Click the extension icon
3. **Reload page**: Sometimes helps with dynamic content
4. **Check console**: Look for any error messages

The extension is designed to work with any GitLab instance, whether it's GitLab.com, GitLab Enterprise, or self-hosted GitLab Community Edition.