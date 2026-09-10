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

type TextStyles = Pick<
  StyledTextValue,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "textTransform"
>;

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
  styles: Pick<StyledLinkValue, keyof TextStyles | "letterSpacing">,
) => ({
  ...getTextStyle(styles),
  letterSpacing:
    styles.letterSpacing === "default" ? undefined : styles.letterSpacing,
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

export const getScopedTypographyStyles = (
  scopeClass: string,
  additionalStyles = "",
) => `
  .${scopeClass} p,
  .${scopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  ${[1, 2, 3, 4, 5, 6]
    .map(
      (level) => `
  .${scopeClass} h${level} {
    font-family: var(--fontFamily-h${level}-fontFamily);
    font-size: var(--fontSize-h${level}-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h${level}-fontWeight);
    font-style: var(--fontStyle-h${level}-fontStyle);
    text-transform: var(--textTransform-h${level}-textTransform);
  }`,
    )
    .join("")}
  .${scopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${scopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
  ${additionalStyles}
`;
