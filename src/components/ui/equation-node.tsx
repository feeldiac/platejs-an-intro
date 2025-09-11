/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import * as React from "react";
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from "react-textarea-autosize";

import "katex/contrib/mhchem";
import "katex/dist/katex.min.js";

import type { TEquationElement } from "platejs";
import type { PlateElementProps } from "platejs/react";

import { useEquationElement, useEquationInput } from "@platejs/math/react";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { CornerDownLeftIcon, RadicalIcon } from "lucide-react";
import {
  createPrimitiveComponent,
  PlateElement,
  useEditorRef,
  useEditorSelector,
  useElement,
  useReadOnly,
  useSelected,
} from "platejs/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function EquationElement(props: PlateElementProps<TEquationElement>) {
  const selected = useSelected();
  const [open, setOpen] = React.useState(selected);
  const [isChemistry, setIsChemistry] = React.useState(
    props.element.texExpression.includes("\\ce") ||
      props.element.texExpression.includes("\\pu")
  );
  const katexRef = React.useRef<HTMLDivElement | null>(null);

  useEquationElement({
    element: props.element,
    katexRef: katexRef,
    options: {
      displayMode: true,
      macros: {
        "\\water": "\\ce{H2O}",
        "\\glucose": "\\ce{C6H12O6}",
      },
      strict: "ignore",
      throwOnError: false,
      trust: true,
    },
  });

  return (
    <PlateElement className="my-1" {...props}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "group flex cursor-pointer items-center justify-center rounded-sm select-none hover:bg-primary/10 data-[selected=true]:bg-primary/10",
              props.element.texExpression.length === 0
                ? "bg-muted p-3 pr-9"
                : "px-2 py-1"
            )}
            data-selected={selected}
            contentEditable={false}
            role="button"
          >
            {props.element.texExpression.length > 0 ? (
              <span ref={katexRef} />
            ) : (
              <div className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                <RadicalIcon className="size-6 text-muted-foreground/80" />
                <div>Add a Tex equation</div>
              </div>
            )}
          </div>
        </PopoverTrigger>

        <EquationPopoverContent
          open={open}
          placeholder={`Math: f(x) = x^2
Chemistry: \\ce{2H2 + O2 -> 2H2O}
Units: \\pu{123 kJ/mol}`}
          isInline={false}
          setOpen={setOpen}
          isChemistry={isChemistry}
          setIsChemistry={setIsChemistry}
        />
      </Popover>

      {props.children}
    </PlateElement>
  );
}

export function InlineEquationElement(
  props: PlateElementProps<TEquationElement>
) {
  const element = props.element;
  const katexRef = React.useRef<HTMLDivElement | null>(null);
  const selected = useSelected();
  const isCollapsed = useEditorSelector(
    (editor) => editor.api.isCollapsed(),
    []
  );
  const [open, setOpen] = React.useState(selected && isCollapsed);
  const [isChemistry, setIsChemistry] = React.useState(
    element.texExpression.includes("\\ce") ||
      element.texExpression.includes("\\pu")
  );

  React.useEffect(() => {
    if (selected && isCollapsed) {
      setOpen(true);
    }
  }, [selected, isCollapsed]);

  useEquationElement({
    element,
    katexRef: katexRef,
    options: {
      displayMode: true,
      macros: {
        "\\water": "\\ce{H2O}",
        "\\glucose": "\\ce{C6H12O6}",
      },
      strict: "ignore",
      throwOnError: false,
      trust: true,
    },
  });

  return (
    <PlateElement
      {...props}
      className={cn(
        "mx-1 inline-block rounded-sm select-none [&_.katex-display]:my-0!"
      )}
    >
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'after:absolute after:inset-0 after:-top-0.5 after:-left-1 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
              "h-6",
              ((element.texExpression.length > 0 && open) || selected) &&
                "after:bg-brand/15",
              element.texExpression.length === 0 &&
                "text-muted-foreground after:bg-neutral-500/10"
            )}
            contentEditable={false}
          >
            <span
              ref={katexRef}
              className={cn(
                element.texExpression.length === 0 && "hidden",
                "font-mono leading-none"
              )}
            />
            {element.texExpression.length === 0 && (
              <span>
                <RadicalIcon className="mr-1 inline-block h-[19px] w-4 py-[1.5px] align-text-bottom" />
                New equation
              </span>
            )}
          </div>
        </PopoverTrigger>

        <EquationPopoverContent
          className="my-auto"
          open={open}
          placeholder="E = mc^2 or \\ce{H2O}"
          setOpen={setOpen}
          isInline
          isChemistry={isChemistry}
          setIsChemistry={setIsChemistry}
        />
      </Popover>

      {props.children}
    </PlateElement>
  );
}

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

const EquationPopoverContent = ({
  className,
  isInline,
  open,
  setOpen,
  ...props
}: {
  isInline: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  isChemistry?: boolean;
  setIsChemistry?: (isChemistry: boolean) => void;
} & TextareaAutosizeProps) => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TEquationElement>();

  React.useEffect(() => {
    if (isInline && open) {
      setOpen(true);
    }
  }, [isInline, open, setOpen]);

  if (readOnly) return null;

  const onClose = () => {
    setOpen(false);

    if (isInline) {
      editor.tf.select(element, { focus: true, next: true });
    } else {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.set(element.id as string);
    }
  };

  // Enhanced version with better Plate integration
  const insertChemistryTemplate = (template: string) => {
    // Method 1: Try to use the textarea directly
    const textarea = document.activeElement as HTMLTextAreaElement;

    if (textarea && textarea.tagName === "TEXTAREA") {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const currentValue = textarea.value || "";

      // Create new value with template inserted
      const newValue =
        currentValue.slice(0, start) + template + currentValue.slice(end);

      // Update textarea using React's synthetic event approach
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, newValue);

        // Dispatch React-compatible input event
        const event = new Event("input", { bubbles: true });
        Object.defineProperty(event, "target", {
          writable: false,
          value: textarea,
        });
        textarea.dispatchEvent(event);
      }

      // Set cursor position after template
      requestAnimationFrame(() => {
        const newCursorPos = start + template.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      });
    } else {
      // Method 2: Use Plate's editor API directly
      const currentValue = element.texExpression || "";
      // @ts-ignore
      editor.setNodes(
        { texExpression: currentValue + template },
        // @ts-ignore
        { at: editor.findPath(element) }
      );
    }
  };

  return (
    <PopoverContent
      className="flex flex-col gap-2 min-w-[400px]"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
    >
      {/* Chemistry Templates */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded">
        <span className="text-xs font-medium text-muted-foreground mb-1 w-full">
          Plantilla de química:
        </span>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => insertChemistryTemplate("\\ce{H2O}")}
        >
          H₂O
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => insertChemistryTemplate("\\ce{2H2 + O2 -> 2H2O}")}
        >
          Reacción
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => insertChemistryTemplate("\\ce{C6H12O6}")}
        >
          Glucosa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => insertChemistryTemplate("\\pu{123 kJ/mol}")}
        >
          Unidades
        </Button>
      </div>

      <div className="flex gap-2">
        <EquationInput
          className={cn("max-h-[50vh] grow resize-none p-2 text-sm", className)}
          state={{ isInline, open, onClose }}
          autoFocus
          {...props}
        />

        <Button variant="secondary" className="px-3" onClick={onClose}>
          Done <CornerDownLeftIcon className="size-3.5" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground px-2">
        <strong>Química:</strong> Usa \ce{} para fórmulas, \pu{} para unidades
        <br />
        <strong>Matemática:</strong> Sintaxis estándar de LaTeX
      </div>
    </PopoverContent>
  );
};
