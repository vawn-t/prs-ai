export interface ApiKey {
  provider: 'openai' | 'gemini';
  key: string;
  model?: string;
}

export interface ApiConfig {
  openai?: {
    key: string;
    model: string;
  };
  gemini?: {
    key: string;
    model: string;
  };
}

export interface PRGenerationRules {
  includeFileChanges: boolean;
  includeCommitMessages: boolean;
  maxDescriptionLength: number;
  titleFormat: 'conventional' | 'descriptive' | 'custom';
  customTitleTemplate?: string;
  descriptionSections: {
    summary: boolean;
    changes: boolean;
    testing: boolean;
    breaking: boolean;
  };
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
