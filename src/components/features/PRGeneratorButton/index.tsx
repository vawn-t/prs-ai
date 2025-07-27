import React, { useState } from 'react';
import { Button, StatusIndicator } from '../../common';
import { ApiConfig, PRGenerationRules, PRGenerationResult } from '@types';
import { useApiConfig, useGenerationRules } from '@hooks';
import { openAIService, geminiService } from '@services';

interface PRGeneratorButtonProps {
  onGenerated?: (result: PRGenerationResult) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const PRGeneratorButton = ({
  onGenerated,
  onError,
  className = '',
  variant = 'primary',
  size = 'md',
}: PRGeneratorButtonProps) => {
  const { config } = useApiConfig();
  const { rules } = useGenerationRules();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastGenerated, setLastGenerated] = useState<PRGenerationResult | null>(
    null,
  );

  const extractPRContext = (): {
    changes: string;
    commits: string;
    files: string[];
  } => {
    const diffElements = document.querySelectorAll(
      '.file-diff-split, .file-diff-unified',
    );
    const changes = Array.from(diffElements)
      .map((el) => el.textContent || '')
      .join('\n');

    const commitElements = document.querySelectorAll(
      '.commit-message, .js-navigation-open',
    );
    const commits = Array.from(commitElements)
      .map((el) => el.textContent || '')
      .join('\n');

    const fileElements = document.querySelectorAll(
      '.file-header [title], .file-info a',
    );
    const files = Array.from(fileElements)
      .map((el) => el.textContent || '')
      .filter(Boolean);

    return { changes, commits, files };
  };

  const generatePRContent = async (): Promise<PRGenerationResult> => {
    if (!config) {
      throw new Error('API configuration not found');
    }

    const context = extractPRContext();

    const prompt = `Generate a professional pull request title and description based on the following information:

Changes:
${context.changes}

Commit Messages:
${context.commits}

Files Changed:
${context.files.join(', ')}

Requirements:
- Title format: ${rules?.titleFormat || 'conventional'}
- Maximum description length: ${rules?.maxDescriptionLength || 2000} characters
- Include file changes: ${rules?.includeFileChanges !== false}
- Include commit messages: ${rules?.includeCommitMessages !== false}
- Include summary: ${rules?.descriptionSections?.summary !== false}
- Include changes: ${rules?.descriptionSections?.changes !== false}
- Include testing notes: ${rules?.descriptionSections?.testing !== false}
- Include breaking changes: ${rules?.descriptionSections?.breaking !== false}

Please provide the response in the following JSON format:
{
  "title": "Generated title here",
  "description": "Generated description here"
}`;

    if (config.openai?.key) {
      try {
        const response = await openAIService.generateText(
          { key: config.openai.key, model: config.openai.model },
          prompt,
        );
        return JSON.parse(response);
      } catch (err) {
        console.warn('OpenAI failed, trying Gemini:', err);
      }
    }

    if (config.gemini?.key) {
      const response = await geminiService.generateText(
        { key: config.gemini.key, model: config.gemini.model },
        prompt,
      );
      return JSON.parse(response);
    }

    throw new Error('No valid API configuration found');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await generatePRContent();
      setLastGenerated(result);
      onGenerated?.(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate PR content';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = config?.openai?.key || config?.gemini?.key;

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={!isConfigured || loading}
        loading={loading}
      >
        {loading ? 'Generating...' : 'Generate PR Content'}
      </Button>

      {error && <StatusIndicator status='error' message={error} showIcon />}

      {lastGenerated && !loading && !error && (
        <StatusIndicator
          status='success'
          message='PR content generated successfully!'
          showIcon
        />
      )}

      {!isConfigured && !loading && (
        <StatusIndicator
          status='warning'
          message='Please configure your API keys in settings'
          showIcon
        />
      )}
    </div>
  );
};
