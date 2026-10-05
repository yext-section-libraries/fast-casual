import {
  getThemeColorCssValue,
  type StyledLinkValue,
  type StyledTextValue,
  type ThemeColor,
  type RichText,
  type TranslatableRichText,
  type YextFieldDefinition,
} from "@yext/visual-editor";

export { getThemeColorCssValue };

type TextStyles = Partial<Pick<
  StyledTextValue,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "textTransform"
>>;

export const getTextStyle = (styles?: TextStyles) => ({
  fontFamily:
    !styles || styles.fontFamily === "default"
      ? undefined
      : styles.fontFamily,
  fontSize:
    !styles || styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight:
    !styles || styles.fontWeight === "default"
      ? undefined
      : styles.fontWeight,
  fontStyle:
    !styles || styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    !styles || styles.textTransform === "default"
      ? undefined
      : styles.textTransform,
});

export const getLinkStyle = (
  styles?: Partial<Pick<StyledLinkValue, keyof TextStyles | "letterSpacing">>,
) => ({
  ...getTextStyle(styles),
  letterSpacing:
    styles?.letterSpacing === "default" ? undefined : styles?.letterSpacing,
});

export const resolveTextColor = (
  color: ThemeColor | undefined,
  fallbackColor: ThemeColor | string,
) => getThemeColorCssValue(color) ?? getThemeColorCssValue(fallbackColor);

export const getRichTextValue = (
  value: TranslatableRichText | undefined,
  locale: string,
): RichText | string | undefined => {
  if (typeof value === "string" || !value) {
    return value;
  }

  if ("html" in value || "json" in value) {
    return value as RichText;
  }

  const localizedValue = value as Record<
    string,
    RichText | string | undefined
  > & { defaultValue?: RichText | string };
  return localizedValue[locale] ?? localizedValue.defaultValue;
};

export const createAspectRatioField = (
  label: YextFieldDefinition<number>["label"],
) =>
  // ASPECT_RATIO emits a number, but the upstream predefined-selector type
  // does not currently associate the option set with its value type.
  ({
    type: "basicSelector",
    label,
    options: "ASPECT_RATIO",
  }) as unknown as YextFieldDefinition<number>;

// Kept for section-specific decoration rules; typography lives in typography.css.
export const getScopedTypographyStyles = (
  _scopeClass: string,
  additionalStyles = "",
) => additionalStyles;
