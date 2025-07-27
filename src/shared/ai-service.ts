import { ApiConfig, PRData, PRGenerationRules } from './types';

export class AIService {
  static async validateApiKey(
    provider: 'openai' | 'gemini',
    apiKey: string,
  ): Promise<boolean> {
    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok;
      } else if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
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
    let prompt = `Generate a professional Pull Request title and description based on the following information:

**Code Changes Summary:**
- Base branch: ${prData.baseBranch}
- Head branch: ${prData.headBranch}
- Files changed: ${prData.changes.length}

**File Changes:**
${prData.changes
  .map(
    (change) =>
      `- ${change.filename} (${change.status}): +${change.additions} -${change.deletions}`,
  )
  .join('\n')}

${
  rules.includeCommitMessages && prData.commitMessages.length > 0
    ? `
**Commit Messages:**
${prData.commitMessages.map((msg) => `- ${msg}`).join('\n')}
`
    : ''
}

**Requirements:**
- Title format: ${
      rules.titleFormat === 'conventional'
        ? 'Conventional Commits format (type(scope): description)'
        : rules.titleFormat === 'descriptive'
        ? 'Clear, descriptive format'
        : 'Custom format'
    }
- Max description length: ${rules.maxDescriptionLength} characters
- Include sections: ${Object.entries(rules.descriptionSections)
      .filter(([_, enabled]) => enabled)
      .map(([section, _]) => section)
      .join(', ')}

${
  existingTemplate?.description
    ? `
**Existing PR Template (follow this structure if provided):**
${existingTemplate.description}
`
    : ''
}

Please respond with a JSON object containing "title" and "description" fields.`;

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
      return JSON.parse(content);
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
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
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
                    '\n\nRespond only with valid JSON containing "title" and "description" fields.',
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
      return JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: content.split('\n')[0] || 'Generated PR Title',
        description: content,
      };
    }
  }
}
