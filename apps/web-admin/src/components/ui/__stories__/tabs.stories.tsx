import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HomeIcon, SearchIcon, SettingsIcon } from "lucide-react";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <h3 className="font-medium">Account Settings</h3>
          <p className="mt-1 text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <h3 className="font-medium">Password</h3>
          <p className="mt-1 text-muted-foreground">
            Change your password and security settings.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <h3 className="font-medium">General Settings</h3>
          <p className="mt-1 text-muted-foreground">
            Configure general application settings.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[500px]">
      <TabsList variant="line">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
        <TabsTrigger value="tab4">History</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="mt-3 rounded-lg border p-4 text-sm">
          Overview content with key metrics and summaries.
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="mt-3 rounded-lg border p-4 text-sm">
          Analytics dashboard with charts and data.
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="mt-3 rounded-lg border p-4 text-sm">
          Generate and view reports here.
        </div>
      </TabsContent>
      <TabsContent value="tab4">
        <div className="mt-3 rounded-lg border p-4 text-sm">
          View activity history and audit logs.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Vertical tabs content for tab 1.
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Vertical tabs content for tab 2.
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Vertical tabs content for tab 3.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const SingleTab: Story = {
  render: () => (
    <Tabs defaultValue="single" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="single">Single Tab</TabsTrigger>
      </TabsList>
      <TabsContent value="single">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          A minimal tabs example with just one tab.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>
        <TabsTrigger value="beta" disabled>Beta (Coming Soon)</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <h3 className="font-medium">General Settings</h3>
          <p className="mt-1 text-muted-foreground">
            These settings are available now. Advanced and Beta tabs are disabled.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="advanced">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">Advanced options — not yet available.</p>
        </div>
      </TabsContent>
      <TabsContent value="beta">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">Beta features — coming in a future release.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="home">
          <HomeIcon />
          Home
        </TabsTrigger>
        <TabsTrigger value="search">
          <SearchIcon />
          Search
        </TabsTrigger>
        <TabsTrigger value="settings">
          <SettingsIcon />
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Home dashboard content with recent activity.
        </div>
      </TabsContent>
      <TabsContent value="search">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Search results and filters.
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="mt-2 rounded-lg border p-4 text-sm">
          Application preferences and configuration.
        </div>
      </TabsContent>
    </Tabs>
  ),
};
