/**
 * PR Generation Utilities
 * Helper functions for validating and generating PR content
 */

import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  TITLE_TEMPLATES,
  DESCRIPTION_SECTIONS,
  CONVENTIONAL_TYPES,
  COMMON_SCOPES,
} from '../constants/pr-generation.constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TitleSuggestion {
  type: string;
  scope?: string;
  description: string;
  full: string;
}

/**
 * Validate PR title according to format and length requirements
 */
export function validatePRTitle(
  title: string,
  format: 'conventional' | 'descriptive' | 'custom',
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Length validation
  if (title.length < VALIDATION_RULES.title.minLength) {
    result.isValid = false;
    result.errors.push(VALIDATION_MESSAGES.title.tooShort);
  }

  if (title.length > VALIDATION_RULES.title.maxLength) {
    result.isValid = false;
    result.errors.push(VALIDATION_MESSAGES.title.tooLong);
  } else if (title.length > VALIDATION_RULES.title.recommendedMaxLength) {
    result.warnings.push(VALIDATION_MESSAGES.title.recommendedLength);
  }

  // Format-specific validation
  if (format === 'conventional') {
    if (!VALIDATION_RULES.title.patterns.conventional.test(title)) {
      result.isValid = false;
      result.errors.push(VALIDATION_MESSAGES.title.invalidConventional);
    }
  }

  // General style validation
  if (
    !VALIDATION_RULES.title.patterns.noUppercaseStart.test(title) &&
    format === 'conventional'
  ) {
    result.warnings.push(VALIDATION_MESSAGES.title.shouldStartLowercase);
  }

  if (!VALIDATION_RULES.title.patterns.noTrailingPeriod.test(title)) {
    result.warnings.push(VALIDATION_MESSAGES.title.noTrailingPeriod);
  }

  return result;
}

/**
 * Validate PR description according to length and content requirements
 */
export function validatePRDescription(description: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (description.length < VALIDATION_RULES.description.minLength) {
    result.isValid = false;
    result.errors.push(VALIDATION_MESSAGES.description.tooShort);
  }

  if (description.length > VALIDATION_RULES.description.maxLength) {
    result.isValid = false;
    result.errors.push(VALIDATION_MESSAGES.description.tooLong);
  } else if (
    description.length > VALIDATION_RULES.description.recommendedMaxLength
  ) {
    result.warnings.push(VALIDATION_MESSAGES.description.recommendedLength);
  }

  return result;
}

/**
 * Parse conventional commit title to extract type, scope, and description
 */
export function parseConventionalTitle(title: string): {
  type?: string;
  scope?: string;
  description?: string;
  isValid: boolean;
} {
  const match = title.match(/^([a-z]+)(\(([^)]+)\))?: (.+)$/);

  if (!match) {
    return { isValid: false };
  }

  const [, type, , scope, description] = match;

  return {
    type,
    scope,
    description,
    isValid: true,
  };
}

/**
 * Generate title suggestions based on file changes
 */
export function generateTitleSuggestions(
  fileChanges: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }>,
  commitMessages: string[] = [],
): TitleSuggestion[] {
  const suggestions: TitleSuggestion[] = [];

  // Analyze file changes to suggest appropriate type and scope
  const hasNewFiles = fileChanges.some((f) => f.status === 'added');
  const hasDocChanges = fileChanges.some((f) =>
    f.filename.match(/\.(md|txt|rst)$/i),
  );
  const hasTestChanges = fileChanges.some((f) =>
    f.filename.match(/\.(test|spec)\./i),
  );
  const hasConfigChanges = fileChanges.some((f) =>
    f.filename.match(/\.(json|yml|yaml|toml|ini)$/i),
  );
  const hasStyleChanges = fileChanges.every((f) =>
    f.filename.match(/\.(css|scss|less|styl)$/i),
  );

  // Determine likely scope based on file paths
  const scopeMap: Record<string, string[]> = {
    api: ['api/', 'server/', 'backend/'],
    ui: ['ui/', 'frontend/', 'client/', 'components/'],
    auth: ['auth/', 'login/', 'authentication/'],
    db: ['db/', 'database/', 'migrations/'],
    config: ['config/', '.env', 'settings/'],
    test: ['test/', 'tests/', '__tests__/'],
    docs: ['docs/', 'documentation/'],
    build: ['build/', 'webpack', 'vite', 'rollup'],
    ci: ['.github/', 'ci/', 'pipeline/'],
  };

  let detectedScope: string | undefined;
  for (const [scope, patterns] of Object.entries(scopeMap)) {
    if (
      fileChanges.some((f) =>
        patterns.some((pattern) => f.filename.includes(pattern)),
      )
    ) {
      detectedScope = scope;
      break;
    }
  }

  // Generate suggestions based on change patterns
  if (hasNewFiles) {
    suggestions.push({
      type: 'feat',
      scope: detectedScope,
      description: 'add new functionality',
      full: `feat${
        detectedScope ? `(${detectedScope})` : ''
      }: add new functionality`,
    });
  }

  if (hasDocChanges) {
    suggestions.push({
      type: 'docs',
      scope: detectedScope,
      description: 'update documentation',
      full: `docs${
        detectedScope ? `(${detectedScope})` : ''
      }: update documentation`,
    });
  }

  if (hasTestChanges) {
    suggestions.push({
      type: 'test',
      scope: detectedScope,
      description: 'add test coverage',
      full: `test${
        detectedScope ? `(${detectedScope})` : ''
      }: add test coverage`,
    });
  }

  if (hasConfigChanges) {
    suggestions.push({
      type: 'chore',
      scope: 'config',
      description: 'update configuration',
      full: 'chore(config): update configuration',
    });
  }

  if (hasStyleChanges) {
    suggestions.push({
      type: 'style',
      scope: detectedScope,
      description: 'update styling',
      full: `style${detectedScope ? `(${detectedScope})` : ''}: update styling`,
    });
  }

  // Fallback suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      {
        type: 'feat',
        scope: detectedScope,
        description: 'implement new feature',
        full: `feat${
          detectedScope ? `(${detectedScope})` : ''
        }: implement new feature`,
      },
      {
        type: 'fix',
        scope: detectedScope,
        description: 'resolve issue',
        full: `fix${detectedScope ? `(${detectedScope})` : ''}: resolve issue`,
      },
      {
        type: 'refactor',
        scope: detectedScope,
        description: 'improve code structure',
        full: `refactor${
          detectedScope ? `(${detectedScope})` : ''
        }: improve code structure`,
      },
    );
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Generate description template based on enabled sections
 */
export function generateDescriptionTemplate(
  enabledSections: Record<string, boolean>,
  customTemplate?: string,
): string {
  if (customTemplate) {
    return customTemplate;
  }

  let template = '';

  // Always include description
  template += '## Description\n';
  template += DESCRIPTION_SECTIONS.summary.template + '\n\n';

  // Add enabled sections
  if (enabledSections.changes) {
    template += '## Changes Made\n';
    template += DESCRIPTION_SECTIONS.changes.template + '\n\n';
  }

  // Always include related issues
  template += '## Related Issues\n';
  template += DESCRIPTION_SECTIONS.relatedIssues.template + '\n\n';

  if (enabledSections.testing) {
    template += '## Testing\n';
    template += DESCRIPTION_SECTIONS.testing.template + '\n\n';
  }

  if (enabledSections.breaking) {
    template += '## Breaking Changes\n';
    template += DESCRIPTION_SECTIONS.breaking.template + '\n\n';
  }

  // Always include additional notes
  template += '## Additional Notes\n';
  template += DESCRIPTION_SECTIONS.additionalNotes.template;

  return template.trim();
}

/**
 * Extract likely PR type from commit messages
 */
export function inferPRTypeFromCommits(commitMessages: string[]): string {
  const typeKeywords = {
    feat: ['feat', 'feature', 'add', 'implement', 'new'],
    fix: ['fix', 'bug', 'resolve', 'patch', 'repair'],
    docs: ['docs', 'doc', 'documentation', 'readme'],
    style: ['style', 'format', 'lint', 'prettier'],
    refactor: ['refactor', 'restructure', 'reorganize', 'cleanup'],
    test: ['test', 'spec', 'coverage'],
    chore: ['chore', 'update', 'upgrade', 'dependency', 'deps'],
    perf: ['perf', 'performance', 'optimize', 'speed'],
  };

  const messagesToAnalyze = commitMessages.join(' ').toLowerCase();

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((keyword) => messagesToAnalyze.includes(keyword))) {
      return type;
    }
  }

  return 'feat'; // Default fallback
}

/**
 * Get file extension based suggestions for scope
 */
export function suggestScopeFromFiles(
  fileChanges: Array<{ filename: string }>,
): string[] {
  const scopeSuggestions = new Set<string>();

  for (const file of fileChanges) {
    const path = file.filename;

    // Check directory-based scopes
    if (path.includes('src/components/')) scopeSuggestions.add('components');
    if (path.includes('src/services/')) scopeSuggestions.add('services');
    if (path.includes('src/utils/')) scopeSuggestions.add('utils');
    if (path.includes('src/hooks/')) scopeSuggestions.add('hooks');
    if (path.includes('src/types/')) scopeSuggestions.add('types');
    if (path.includes('src/constants/')) scopeSuggestions.add('constants');

    // Check file extension based scopes
    if (path.endsWith('.test.ts') || path.endsWith('.spec.ts'))
      scopeSuggestions.add('test');
    if (path.endsWith('.md')) scopeSuggestions.add('docs');
    if (path.endsWith('.css') || path.endsWith('.scss'))
      scopeSuggestions.add('styles');
    if (path.includes('package.json')) scopeSuggestions.add('deps');
    if (path.includes('webpack') || path.includes('vite'))
      scopeSuggestions.add('build');
    if (path.includes('.github/')) scopeSuggestions.add('ci');
  }

  return Array.from(scopeSuggestions).slice(0, 5);
}

/**
 * Calculate PR complexity score based on changes
 */
export function calculatePRComplexity(
  fileChanges: Array<{
    filename: string;
    additions: number;
    deletions: number;
  }>,
): {
  score: number;
  level: 'simple' | 'moderate' | 'complex';
  recommendation: string;
} {
  const totalFiles = fileChanges.length;
  const totalLines = fileChanges.reduce(
    (sum, f) => sum + f.additions + f.deletions,
    0,
  );
  const avgLinesPerFile = totalLines / totalFiles;

  let score = 0;

  // File count impact
  if (totalFiles <= 3) score += 1;
  else if (totalFiles <= 10) score += 2;
  else score += 3;

  // Line count impact
  if (totalLines <= 50) score += 1;
  else if (totalLines <= 200) score += 2;
  else score += 3;

  // File diversity impact
  const extensions = new Set(
    fileChanges.map((f) => f.filename.split('.').pop()),
  );
  if (extensions.size > 3) score += 1;

  let level: 'simple' | 'moderate' | 'complex';
  let recommendation: string;

  if (score <= 3) {
    level = 'simple';
    recommendation = 'This PR is appropriately sized for easy review.';
  } else if (score <= 5) {
    level = 'moderate';
    recommendation =
      'This PR is moderately complex. Consider detailed testing notes.';
  } else {
    level = 'complex';
    recommendation =
      'This PR is complex. Consider breaking it into smaller, focused PRs.';
  }

  return { score, level, recommendation };
}
