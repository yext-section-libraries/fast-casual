import * as React from "react";
import {
  EntityField,
  MaybeRTF,
  resolveComponentData,
  useDocument,
  type MaybeRTFProps,
  type RichTextStyleOverrides,
  type StyledRichTextProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { getTextStyle, getThemeColorCssValue } from "./styleHelpers";
import "./typography.css";

export const getBodyTextStyle = (
  styles?: Parameters<typeof getTextStyle>[0],
): React.CSSProperties => {
  const resolved = getTextStyle(styles);
  const variables: Record<string, string> = {};
  for (const [property, value] of Object.entries(resolved)) {
    if (value !== undefined) {
      variables[`--fast-casual-body-${property}`] = value;
      variables[`--${property}-body-${property}`] = value;
    }
  }
  return { ...resolved, ...variables };
};

export const TypographyScope = ({ children }: { children: React.ReactNode }) => (
  <div className="fast-casual-typography components">{children}</div>
);

type ResolvedTextProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  richTextStyleOverrides?: RichTextStyleOverrides;
};

// Resolved entity fields can wrap a MaybeRTF. Forward overrides all the way to
// that renderer, whose inner .components scope can reset platform body tokens.
export const applyRichTextOverrides = (
  node: React.ReactNode,
  overrides: RichTextStyleOverrides,
): React.ReactNode => {
  if (!React.isValidElement<ResolvedTextProps>(node)) return node;
  const style = {
    ...getBodyTextStyle(overrides),
    color: getThemeColorCssValue(overrides.color),
  };
  if (node.type === MaybeRTF) {
    return React.cloneElement(node, {
      richTextStyleOverrides: { ...node.props.richTextStyleOverrides, ...overrides },
      style: { ...node.props.style, ...style },
    });
  }
  if (node.type === React.Fragment) {
    return React.cloneElement(node, {
      children: React.Children.map(node.props.children, (child) =>
        applyRichTextOverrides(child, overrides),
      ),
    });
  }
  return React.cloneElement(node, {
    style: {
      ...node.props.style,
      ...(typeof node.type === "string" && /^(h[1-6]|a|button)$/.test(node.type)
        ? { color: style.color }
        : style),
    },
    children: React.Children.map(node.props.children, (child) =>
      applyRichTextOverrides(child, overrides),
    ),
  });
};

export const FastCasualRichText = ({
  data,
  richTextStyleOverrides,
  style,
  ...props
}: Omit<MaybeRTFProps, "data"> & { data: unknown }): React.ReactElement | null => {
  const overrides = {
    ...richTextStyleOverrides,
    ...getTextStyle(richTextStyleOverrides),
  };
  if (React.isValidElement(data)) {
    return <>{applyRichTextOverrides(data, overrides)}</>;
  }
  if (typeof data !== "string" && !(data && typeof data === "object" && "html" in data)) {
    return null;
  }
  return (
    <MaybeRTF
      {...props}
      data={
        typeof data === "string" && /<[a-z][\s\S]*>/i.test(data)
          ? { html: data }
          : data as MaybeRTFProps["data"]
      }
      richTextStyleOverrides={overrides}
      style={{ ...style, ...getBodyTextStyle(overrides) }}
    />
  );
};

export const FastCasualStyledRichText = ({
  data,
  fontOptions,
  alignment,
}: StyledRichTextProps & { kind: "richText" }) => {
  const { i18n } = useTranslation();
  const document = useDocument();
  const content = resolveComponentData(data.text, i18n.language, document);
  return (
    <EntityField
      displayName="Body"
      fieldId={data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      <div style={{ textAlign: alignment, ...getBodyTextStyle(fontOptions) }}>
        <FastCasualRichText data={content} richTextStyleOverrides={fontOptions} />
      </div>
    </EntityField>
  );
};
