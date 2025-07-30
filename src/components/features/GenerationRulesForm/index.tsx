import { useEffect, useState } from 'react';
import { PRGenerationRules } from '@types';
import { Button, Input, Select, StatusIndicator, Checkbox } from '../../common';
import { useGenerationRules } from '@hooks';
import { DEFAULT_GENERATION_RULES } from '@constants';

interface GenerationRulesFormProps {
  onSave?: (rules: PRGenerationRules) => void;
  className?: string;
}

export const GenerationRulesForm = ({
  onSave,
  className = '',
}: GenerationRulesFormProps) => {
  const { rules, loading, error, saveRules } = useGenerationRules();

  const [formData, setFormData] = useState<PRGenerationRules>(
    () => rules || DEFAULT_GENERATION_RULES,
  );

  useEffect(() => {
    if (rules) {
      setFormData(rules);
    }
  }, [rules]);

  const handleSave = async () => {
    try {
      await saveRules(formData);
      onSave?.(formData);
    } catch (err) {
      console.error('Failed to save rules:', err);
    }
  };

  const updateField = <K extends keyof PRGenerationRules>(
    field: K,
    value: PRGenerationRules[K],
  ) => {
    setFormData((prev: PRGenerationRules) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <StatusIndicator
          status='loading'
          message='Loading generation rules...'
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && <StatusIndicator status='error' message={error} />}

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Title Generation
        </h3>

        <div className='space-y-4'>
          <Select
            label='Title Format'
            value={formData.titleFormat}
            onChange={(value) =>
              updateField(
                'titleFormat',
                value as PRGenerationRules['titleFormat'],
              )
            }
            options={[
              {
                value: 'conventional',
                label: 'Conventional (feat: description)',
              },
              {
                value: 'descriptive',
                label: 'Descriptive (Clear action statement)',
              },
              { value: 'custom', label: 'Custom template' },
            ]}
          />

          {formData.titleFormat === 'custom' && (
            <Input
              label='Custom Title Template'
              value={formData.customTitleTemplate || ''}
              onChange={(value) =>
                updateField('customTitleTemplate', value || undefined)
              }
              placeholder='e.g., [{{type}}] {{description}}'
              multiline
              rows={2}
            />
          )}
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Description Generation
        </h3>

        <div className='space-y-4'>
          <Input
            label='Max Description Length'
            type='number'
            value={formData.maxDescriptionLength.toString()}
            onChange={(value) =>
              updateField('maxDescriptionLength', parseInt(value) || 2000)
            }
            min={100}
            max={5000}
            className='w-40'
          />

          <div className='space-y-3'>
            <Checkbox
              checked={formData.includeFileChanges}
              onChange={(checked) => updateField('includeFileChanges', checked)}
              label='Include file changes in description'
            />

            <Checkbox
              checked={formData.includeCommitMessages}
              onChange={(checked) =>
                updateField('includeCommitMessages', checked)
              }
              label='Include commit messages'
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Description Sections
        </h3>

        <div className='space-y-3'>
          <Checkbox
            checked={formData.descriptionSections.summary}
            onChange={(checked) =>
              updateField('descriptionSections', {
                ...formData.descriptionSections,
                summary: checked,
              })
            }
            label='Include summary section'
          />

          <Checkbox
            checked={formData.descriptionSections.changes}
            onChange={(checked) =>
              updateField('descriptionSections', {
                ...formData.descriptionSections,
                changes: checked,
              })
            }
            label='Include detailed changes section'
          />

          <Checkbox
            checked={formData.descriptionSections.testing}
            onChange={(checked) =>
              updateField('descriptionSections', {
                ...formData.descriptionSections,
                testing: checked,
              })
            }
            label='Include testing notes section'
          />

          <Checkbox
            checked={formData.descriptionSections.breaking}
            onChange={(checked) =>
              updateField('descriptionSections', {
                ...formData.descriptionSections,
                breaking: checked,
              })
            }
            label='Include breaking changes section'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button variant='primary' onClick={handleSave}>
          Save Rules
        </Button>
      </div>
    </div>
  );
};
