import type { Meta, StoryObj } from "@storybook/react";
import { FormFieldWrapper, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof FormFieldWrapper> = {
  title: "UI/Form",
  component: FormFieldWrapper,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormFieldWrapper>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <FormFieldWrapper label="Nama Lengkap">
        <Input placeholder="Masukkan nama lengkap" />
      </FormFieldWrapper>
    </div>
  ),
};

export const WithRequired: Story = {
  render: () => (
    <div className="w-[300px]">
      <FormFieldWrapper label="Email" required>
        <Input type="email" placeholder="email@example.com" />
      </FormFieldWrapper>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-[300px]">
      <FormFieldWrapper
        label="Password"
        required
        error={{ type: "manual", message: "Password minimal 8 karakter" }}
      >
        <Input type="password" defaultValue="abc" />
      </FormFieldWrapper>
    </div>
  ),
};

export const WithLongError: Story = {
  render: () => (
    <div className="w-[300px]">
      <FormFieldWrapper
        label="Deskripsi"
        error={{
          type: "manual",
          message: "Deskripsi harus diisi dan tidak boleh mengandung karakter khusus atau URL yang tidak valid.",
        }}
      >
        <Input />
      </FormFieldWrapper>
    </div>
  ),
};

export const WithoutLabel: Story = {
  render: () => (
    <div className="w-[300px]">
      <FormFieldWrapper>
        <Input placeholder="Input tanpa label" />
      </FormFieldWrapper>
    </div>
  ),
};

export const FormMessageExample: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <p className="mb-1 text-sm font-medium">With error:</p>
        <FormMessage>Email sudah terdaftar</FormMessage>
      </div>
      <div>
        <p className="mb-1 text-sm font-medium">Empty (null):</p>
        <FormMessage>{null}</FormMessage>
        <p className="text-xs text-muted-foreground">Tidak merender apapun</p>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Register</h3>
      <FormFieldWrapper label="Nama" required>
        <Input placeholder="Nama lengkap" />
      </FormFieldWrapper>
      <FormFieldWrapper label="Email" required>
        <Input type="email" placeholder="email@example.com" />
      </FormFieldWrapper>
      <FormFieldWrapper
        label="Password"
        required
        error={{ type: "manual", message: "Password minimal 8 karakter" }}
      >
        <Input type="password" />
      </FormFieldWrapper>
      <FormFieldWrapper label="Bio">
        <Input placeholder="Cerita singkat tentang diri Anda" />
      </FormFieldWrapper>
    </div>
  ),
};
