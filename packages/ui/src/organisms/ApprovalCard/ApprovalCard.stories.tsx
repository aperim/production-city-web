import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApprovalCard } from './ApprovalCard';

const meta = {
  title: 'Organisms/ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    onApprove: () => alert('Approved'),
    onReject: () => alert('Rejected'),
  },
};

export const WithCustomInitial: Story = {
  args: {
    name: 'Bob Jones',
    email: 'bob@example.com',
    role: 'Admin',
    avatarInitial: 'BJ',
    onApprove: () => {},
    onReject: () => {},
  },
};

export const LongName: Story = {
  args: {
    name: 'Very Long User Name That Should Be Truncated',
    email: 'verylongemailaddress@verylongdomainname.example.com',
    role: 'Member',
    onApprove: () => {},
    onReject: () => {},
  },
};

export const ApprovalList: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-md">
      <ApprovalCard
        name="Jane Smith"
        email="jane@example.com"
        role="Editor"
        onApprove={() => {}}
        onReject={() => {}}
      />
      <ApprovalCard
        name="Bob Jones"
        email="bob@example.com"
        role="Member"
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  ),
};
