import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider } from "react-hook-form";
import { FormFieldWrapper, FormMessage } from "../form";

describe("FormFieldWrapper", () => {
  it("renders children", () => {
    render(<FormFieldWrapper><input data-testid="child" /></FormFieldWrapper>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<FormFieldWrapper label="Nama Lengkap"><input /></FormFieldWrapper>);
    expect(screen.getByText("Nama Lengkap")).toBeInTheDocument();
  });

  it("renders required indicator when required", () => {
    render(<FormFieldWrapper label="Email" required><input /></FormFieldWrapper>);
    const asterisk = screen.getByText("*");
    expect(asterisk).toHaveClass("text-destructive");
  });

  it("does not render label when not provided", () => {
    const { container } = render(<FormFieldWrapper><input /></FormFieldWrapper>);
    expect(container.querySelector("label")).not.toBeInTheDocument();
  });

  it("renders error message when error is present", () => {
    render(
      <FormFieldWrapper
        label="Nama"
        error={{ message: "Field ini wajib diisi", type: "required" }}
      >
        <input />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Field ini wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Field ini wajib diisi")).toHaveClass("text-destructive");
  });

  it("does not render error when no error", () => {
    const { container } = render(<FormFieldWrapper label="Nama"><input /></FormFieldWrapper>);
    expect(container.querySelector(".text-destructive")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FormFieldWrapper className="custom-wrapper"><input /></FormFieldWrapper>
    );
    expect(container.firstChild).toHaveClass("custom-wrapper");
  });
});

describe("FormMessage", () => {
  const mockFormContext = {
    getFieldState: () => ({}),
    formState: { errors: {} },
  };

  it("renders children", () => {
    render(
      <FormProvider {...mockFormContext}>
        <FormMessage>Error message</FormMessage>
      </FormProvider>
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("returns null when no children", () => {
    const { container } = render(
      <FormProvider {...mockFormContext}>
        <FormMessage />
      </FormProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when children is empty string", () => {
    const { container } = render(
      <FormProvider {...mockFormContext}>
        <FormMessage>{""}</FormMessage>
      </FormProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("applies destructive style", () => {
    render(
      <FormProvider {...mockFormContext}>
        <FormMessage>Error</FormMessage>
      </FormProvider>
    );
    expect(screen.getByText("Error")).toHaveClass("text-destructive");
  });

  it("applies custom className", () => {
    render(
      <FormProvider {...mockFormContext}>
        <FormMessage className="custom-msg">Error</FormMessage>
      </FormProvider>
    );
    expect(screen.getByText("Error")).toHaveClass("custom-msg");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(
      <FormProvider {...mockFormContext}>
        <FormMessage ref={ref}>Error</FormMessage>
      </FormProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});
