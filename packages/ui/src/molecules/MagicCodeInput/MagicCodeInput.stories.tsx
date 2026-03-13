import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MagicCodeInput } from './MagicCodeInput';

const meta = {
  title: 'Molecules/MagicCodeInput',
  component: MagicCodeInput,
  tags: ['autodocs'],
} satisfies Meta<typeof MagicCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onComplete: (code: string) => alert(`Code: ${code}`) },
};

export const WithError: Story = {
  args: {
    onComplete: () => {},
    error: 'Invalid code. Please try again.',
  },
};

export const Disabled: Story = {
  args: { onComplete: () => {}, disabled: true },
};

export const FourDigits: Story = {
  args: { onComplete: (code: string) => alert(`Code: ${code}`), length: 4 },
};

export const LeadingZeroDemo: StoryObj = {
  render: () => {
    const [result, setResult] = useState('');
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Paste &quot;012345&quot; to verify leading zeros are preserved.
        </p>
        <MagicCodeInput onComplete={(code) => setResult(code)} />
        {result && (
          <p className="text-sm">
            Submitted code: <code className="font-mono bg-muted px-1 rounded-sm">{result}</code>
          </p>
        )}
      </div>
    );
  },
};

export const PasteDemo: StoryObj = {
  render: () => {
    const [result, setResult] = useState('');
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Paste a 6-digit code to fill all fields at once.
        </p>
        <MagicCodeInput onComplete={(code) => setResult(code)} />
        {result && (
          <p className="text-sm">
            Submitted code: <code className="font-mono bg-muted px-1 rounded-sm">{result}</code>
          </p>
        )}
      </div>
    );
  },
};
