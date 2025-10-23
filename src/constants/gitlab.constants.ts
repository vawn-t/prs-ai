// GitLab URL Patterns
export const GITLAB_URL_PATTERNS = {
  MERGE_REQUEST_NEW: /\/-\/merge_requests\/new/,
  MERGE_REQUEST_EDIT: /\/-\/merge_requests\/\d+\/edit/,
  MERGE_REQUEST_VIEW: /\/-\/merge_requests\/\d+$/,
  COMPARE: /\/-\/compare\//,
} as const;

// GitLab DOM Selectors
export const GITLAB_SELECTORS = {
  TITLE_INPUT:
    '#merge_request_title, input[name="merge_request[title]"], #issuable-title, .js-issuable-title, input[data-qa-selector="issuable_form_title_field"]',
  DESCRIPTION_TEXTAREA:
    '#merge_request_description, textarea[name="merge_request[description]"], #issuable-description, .js-issuable-description, #issue_description, textarea[data-qa-selector="issuable_form_description_field"]',
  FORM_CONTAINER:
    '.merge-request-form, .issuable-form, .new-merge-request, .merge-request-page',
  SUBMIT_AREA:
    '.form-actions, .issuable-actions, .merge-request-form .form-actions, .js-issuable-form-actions',
  BTN_GROUP: '.btn-group, .gl-button-group, .form-actions .btn-group',
} as const;
