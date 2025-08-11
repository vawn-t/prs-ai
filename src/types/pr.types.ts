// Pull Request Related Types
export interface PRGenerationRules {
  includeFileChanges: boolean;
  includeCommitMessages: boolean;
  maxDescriptionLength: number;
  titleFormat: 'conventional' | 'descriptive' | 'custom';
  customTitleTemplate?: string;
  customDescriptionTemplate?: string;
  descriptionSections: {
    summary: boolean;
    changes: boolean;
    testing: boolean;
    breaking: boolean;
  };
}

export interface GenerationRules {
  // Title generation
  titleStyle: 'conventional' | 'descriptive' | 'technical' | 'business';
  titleMaxLength: number;
  includeTicketNumber: boolean;

  // Description generation
  descriptionFormat: 'bullet-points' | 'paragraphs' | 'structured';
  includeSummary: boolean;
  includeChanges: boolean;
  includeTesting: boolean;

  // Content preferences
  detailLevel: 'minimal' | 'moderate' | 'detailed';
  tone: 'professional' | 'casual' | 'technical';
  includeCodeSnippets: boolean;

  // Custom template
  customTemplate?: string;
}

export interface PRTemplate {
  title?: string;
  description?: string;
}

export interface CodeChange {
  filename: string;
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  patch?: string;
}

export interface PRData {
  title: string;
  description: string;
  changes: CodeChange[];
  commitMessages: string[];
  baseBranch: string;
  headBranch: string;
}

export interface PRGenerationResult {
  title: string;
  description: string;
}
