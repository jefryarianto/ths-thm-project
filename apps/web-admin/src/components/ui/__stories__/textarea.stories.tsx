import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Tulis sesuatu...",
  },
};

export const WithValue: Story = {
  args: {
    value: "Ini adalah contoh teks yang sudah diisi dalam textarea.",
    readOnly: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[400px] gap-2">
      <Label htmlFor="bio">Biografi</Label>
      <Textarea id="bio" placeholder="Ceritakan tentang diri Anda..." />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Textarea disabled",
    disabled: true,
  },
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-[400px] gap-2">
      <Label htmlFor="desc-with-error">Deskripsi</Label>
      <Textarea
        id="desc-with-error"
        defaultValue="Pendek"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm font-medium text-destructive">
        Deskripsi minimal 50 karakter
      </p>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[400px] flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="small-textarea">Small (3 rows)</Label>
        <Textarea id="small-textarea" rows={3} placeholder="Textarea kecil..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="large-textarea">Large (8 rows)</Label>
        <Textarea id="large-textarea" rows={8} placeholder="Textarea besar..." />
      </div>
    </div>
  ),
};

export const CharacterLimit: Story = {
  render: () => (
    <div className="grid w-[400px] gap-2">
      <Label htmlFor="limited-textarea">Bio (max 100 karakter)</Label>
      <Textarea
        id="limited-textarea"
        maxLength={100}
        placeholder="Maksimal 100 karakter..."
        defaultValue="Halo, saya seorang developer."
      />
      <p className="text-xs text-muted-foreground text-right">32/100</p>
    </div>
  ),
};
