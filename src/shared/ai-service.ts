import { API_ENDPOINTS } from '@constants';
import { ApiConfig, PRData, PRGenerationRules } from './types';

export class AIService {
  static async validateApiKey(
    provider: 'openai' | 'gemini',
    apiKey: string,
  ): Promise<boolean> {
    try {
      if (provider === 'openai') {
        const response = await fetch(API_ENDPOINTS.OPENAI_MODELS, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok;
      } else if (provider === 'gemini') {
        const response = await fetch(
          `${API_ENDPOINTS.GEMINI_MODELS}?key=${apiKey}`,
        );
        return response.ok;
      }
      return false;
    } catch (error) {
      console.error('API validation error:', error);
      return false;
    }
  }

  static async generatePRContent(
    prData: PRData,
    rules: PRGenerationRules,
    apiConfig: ApiConfig,
    existingTemplate?: { title?: string; description?: string },
  ): Promise<{ title: string; description: string }> {
    console.log('AIService: Starting generation with:', {
      prData,
      rules,
      apiConfig: {
        hasOpenai: !!apiConfig.openai,
        hasGemini: !!apiConfig.gemini,
        openaiHasKey: !!apiConfig.openai?.key,
        geminiHasKey: !!apiConfig.gemini?.key,
        openaiModel: apiConfig.openai?.model,
        geminiModel: apiConfig.gemini?.model,
      },
      existingTemplate,
    });

    const prompt = this.buildPrompt(prData, rules, existingTemplate);
    console.log('AIService: Built prompt:', prompt);

    // Try OpenAI first, then Gemini
    if (apiConfig.openai?.key) {
      try {
        console.log('AIService: Trying OpenAI...');
        const result = await this.callOpenAI(prompt, apiConfig.openai);
        console.log('AIService: OpenAI success:', result);
        return result;
      } catch (error) {
        console.error('AIService: OpenAI API error:', error);
      }
    } else {
      console.log('AIService: No OpenAI key available');
    }

    if (apiConfig.gemini?.key) {
      try {
        console.log('AIService: Trying Gemini...');
        const result = await this.callGemini(prompt, apiConfig.gemini);
        console.log('AIService: Gemini success:', result);
        return result;
      } catch (error) {
        console.error('AIService: Gemini API error:', error);
      }
    } else {
      console.log('AIService: No Gemini key available');
    }

    console.error('AIService: No working API keys found');
    throw new Error('No working API keys found');
  }

  private static buildPrompt(
    prData: PRData,
    rules: PRGenerationRules,
    existingTemplate?: { title?: string; description?: string },
  ): string {
    // Build comprehensive prompt based on professional PR guide
    let prompt = `You are an expert software engineer creating a professional GitHub Pull Request. Generate a high-quality PR title and description following industry best practices.

**CODEBASE ANALYSIS:**
- Repository: ${prData.baseBranch} ← ${prData.headBranch}
- Files changed: ${prData.changes.length}
- Total additions: ${prData.changes.reduce(
      (sum, change) => sum + change.additions,
      0,
    )}
- Total deletions: ${prData.changes.reduce(
      (sum, change) => sum + change.deletions,
      0,
    )}

**FILE CHANGES DETAILS:**
${prData.changes
  .map(
    (change) =>
      `- ${change.filename} (${change.status}): +${change.additions} -${change.deletions}`,
  )
  .join('\n')}

${
  rules.includeCommitMessages && prData.commitMessages.length > 0
    ? `
**COMMIT HISTORY:**
${prData.commitMessages.map((msg) => `- ${msg}`).join('\n')}
`
    : ''
}

**TITLE REQUIREMENTS:**
- Format: ${
      rules.titleFormat === 'conventional'
        ? 'Conventional Commits format: type(scope): description'
        : rules.titleFormat === 'descriptive'
        ? 'Clear, descriptive action statement'
        : rules.customTitleTemplate
        ? `Custom format: ${rules.customTitleTemplate}`
        : 'Professional descriptive format'
    }
- Length: Maximum 72 characters, ideally under 50
- Style: Use imperative mood (e.g., "Add feature" not "Added feature")
- Avoid: Vague terms like "update" or "improve" without context

${
  rules.titleFormat === 'conventional'
    ? `
**CONVENTIONAL COMMIT TYPES:**
- feat: New feature or functionality
- fix: Bug fix  
- docs: Documentation changes
- style: Code style/formatting (no functional change)
- refactor: Code refactoring without changing functionality
- test: Adding or updating tests
- chore: Maintenance tasks (dependencies, config)
- perf: Performance improvements
- ci: CI/CD pipeline changes
- build: Build system changes
`
    : ''
}

**DESCRIPTION REQUIREMENTS:**
- Max length: ${rules.maxDescriptionLength} characters
- Format: Professional markdown structure
${
  rules.customDescriptionTemplate?.trim()
    ? `- Use the custom template provided below
- Customize the template content based on actual code changes
- Keep the overall structure but replace placeholders with specific details`
    : `- Include sections: ${Object.entries(rules.descriptionSections)
        .filter(([_, enabled]) => enabled)
        .map(([section, _]) => {
          const sectionMap: Record<string, string> = {
            summary: 'Description (what and why)',
            changes: 'Changes Made (specific bullet points)',
            testing: 'Testing (verification methods)',
            breaking: 'Breaking Changes (if any)',
          };
          return sectionMap[section] || section;
        })
        .join(', ')}`
}

${
  rules.customDescriptionTemplate?.trim()
    ? `**CUSTOM DESCRIPTION TEMPLATE:**
${rules.customDescriptionTemplate}

Use this template as the base structure, but customize the content based on the actual code changes. Replace any placeholder text with specific details from the file changes and commit messages.`
    : `**DESCRIPTION STRUCTURE TEMPLATE:**
## Description
[Clear explanation of what the PR does and why it's needed - provide business/technical context]

${
      rules.descriptionSections.changes
        ? '## Changes Made\n- [Specific modifications using bullet points]\n- [Focus on key changes, e.g., "Added X feature to Y module"]\n'
        : ''
    }
## Related Issues
- [Link relevant issues: "Closes #123", "Fixes #456", or "N/A" if none]

${
      rules.descriptionSections.testing
        ? '## Testing\n- [Describe verification methods: unit tests, manual testing, CI/CD]\n- [Mention specific test cases or scenarios covered]\n'
        : ''
    }
${
      rules.descriptionSections.breaking
        ? '## Breaking Changes\n- [List any breaking changes affecting existing functionality]\n- [Include migration instructions if applicable, or "None" if no breaking changes]\n'
        : ''
    }
## Additional Notes
- [Any limitations, follow-up tasks, or reviewer instructions, or "None"]`
}
${
  rules.descriptionSections.breaking
    ? '## Breaking Changes\n- [List any breaking changes affecting existing functionality]\n- [Include migration instructions if applicable, or "None" if no breaking changes]\n'
    : ''
}
## Additional Notes
- [Any limitations, follow-up tasks, or reviewer instructions, or "None"]

${
  existingTemplate?.description
    ? `
**EXISTING PR TEMPLATE (follow this structure if provided):**
${existingTemplate.description}
`
    : ''
}

**OUTPUT REQUIREMENTS:**
- Return ONLY a valid JSON object with "title" and "description" fields
- Title: Professional, concise, follows specified format
- Description: Well-structured markdown following the template above
- Ensure all specified sections are included
- Make content specific to the actual changes shown in the file list
- Use professional tone suitable for code review

Analyze the code changes carefully and generate appropriate content that reflects the actual modifications made.`;

    return prompt;
  }

  private static async callOpenAI(
    prompt: string,
    config: { key: string; model: string },
  ): Promise<{ title: string; description: string }> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates professional GitHub PR titles and descriptions. Always respond with valid JSON containing "title" and "description" fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      return JSON.parse(jsonText);
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: content.split('\n')[0] || 'Generated PR Title',
        description: content,
      };
    }
  }

  private static async callGemini(
    prompt: string,
    config: { key: string; model: string },
  ): Promise<{ title: string; description: string }> {
    const response = await fetch(
      `${API_ENDPOINTS.GEMINI_MODELS}/${config.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': `${config.key}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    prompt +
                    '\n\nRespond with ONLY a valid JSON object containing "title" and "description" fields. Do not use markdown formatting or code blocks.',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      return JSON.parse(jsonText);
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: content.split('\n')[0] || 'Generated PR Title',
        description: content,
      };
    }
  }
}
