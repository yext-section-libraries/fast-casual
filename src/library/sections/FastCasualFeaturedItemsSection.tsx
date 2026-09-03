import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  createItemSource,
  EntityField,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
  MaybeRTF,
  StyledTextValue,
  StyledImageValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableCTA,
  TranslatableRichText,
  TranslatableString,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  resolveComponentData,
  toPuckFields,
  useDocument,
  isDarkColor,
} from "@yext/visual-editor";

type FeaturedItem = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<TranslatableAssetImage>;
  cta: YextEntityField<TranslatableCTA>;
};

const featuredItemsSource = createItemSource<FeaturedItem>({
  label: "Featured Items",
  mappingFields: {
    title: {
      label: "Title",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    description: {
      label: "Description",
      type: "entityField",
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      label: "Image",
      type: "entityField",
      filter: { types: ["type.image"] },
    },
    cta: {
      label: "Call to Action",
      type: "entityField",
      filter: { types: ["type.cta"] },
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Redwood Smokehouse Burger" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "A wood-fired double smash burger topped with smoked cheddar, crispy onions, bourbon bacon jam, arugula, and house redwood sauce on a toasted brioche bun. Served with hand-cut fries.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: { defaultValue: "Learn More" },
          link: { defaultValue: "#" },
          linkType: "URL",
          openInNewTab: false,
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Chicken Sandwich" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Crispy buttermilk fried chicken layered with hot honey glaze, dill pickles, shredded lettuce, and chipotle aioli on a buttered potato bun. A local favorite during happy hour and weekend brunch.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: { defaultValue: "Learn More" },
          link: { defaultValue: "#" },
          linkType: "URL",
          openInNewTab: false,
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Hill Country Steak Salad" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Grilled skirt steak served over mixed greens with roasted corn, avocado, pickled red onions, cotija cheese, tortilla strips, and cilantro-lime vinaigrette. Fresh, hearty, and distinctly [[address.region]]-inspired.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: {
        field: "",
        constantValue: {
          label: { defaultValue: "Learn More" },
          link: { defaultValue: "#" },
          linkType: "URL",
          openInNewTab: false,
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type FeaturedProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  title: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  description: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  image: {
    styles: StyledImageValue;
  };
  cardBackgroundColor: ThemeColor;
  items: typeof featuredItemsSource.value;
  cta: {
    variant: ComprehensiveCTAValue["styles"]["variant"];
    color?: ThemeColor;
  };
};

const FeaturedFields: YextFields<FeaturedProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
    },
  },
  items: featuredItemsSource.field,
  title: {
    label: "Title",
    type: "object",
    objectFields: {
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
    },
  },
  description: {
    label: "Description",
    type: "object",
    objectFields: {
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
    },
  },
  image: {
    label: "Image",
    type: "object",
    objectFields: {
      styles: {
        label: "Image Styles",
        type: "styledImage",
      },
    },
  },
  cardBackgroundColor: {
    label: "Card Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  cta: {
    label: "Card Call to Action",
    type: "object",
    objectFields: {
      variant: {
        label: "Variant",
        type: "select",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
          { label: "Link", value: "link" },
        ],
      },
      color: {
        label: "Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
};

const themeColorToCss = (color?: ThemeColor | string) => {
  if (!color) {
    return undefined;
  }

  const selectedColor = typeof color === "string" ? color : color.selectedColor;

  if (selectedColor.startsWith("[") && selectedColor.endsWith("]")) {
    return selectedColor.slice(1, -1);
  }

  switch (selectedColor) {
    case "palette-primary":
      return "var(--colors-palette-primary)";
    case "palette-secondary":
      return "var(--colors-palette-secondary)";
    case "palette-tertiary":
      return "var(--colors-palette-tertiary)";
    case "palette-quaternary":
      return "var(--colors-palette-quaternary)";
    case "palette-primary-dark":
      return "hsl(from var(--colors-palette-primary) h s 20)";
    case "palette-secondary-dark":
      return "hsl(from var(--colors-palette-secondary) h s 20)";
    case "white":
      return "#FFFFFF";
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
    default:
      return selectedColor;
  }
};

const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  fallbackColor: ThemeColor | string,
) => themeColorToCss(fontColor) ?? themeColorToCss(fallbackColor);

const toRenderableText = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.defaultValue === "string") {
      return record.defaultValue;
    }

    if (typeof record.text === "string") {
      return record.text;
    }

    if (record.text && typeof record.text === "object") {
      const nested = record.text as Record<string, unknown>;
      if (typeof nested.defaultValue === "string") {
        return nested.defaultValue;
      }
    }
  }

  return "";
};

const toRenderableCTA = (
  cta: TranslatableCTA,
  styles: FeaturedProps["cta"],
): Partial<ComprehensiveCTAValue> => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: cta,
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: cta.openInNewTab ?? false,
  },
  styles: {
    variant: styles.variant,
    color: styles.color,
  },
});

const resolveImageBorderRadius = (
  borderRadius?: StyledImageValue["borderRadius"],
) => (borderRadius === "default" ? "14px" : borderRadius);

const textStylesToCss = (styles?: StyledTextValue) => {
  if (!styles) {
    return {};
  }

  return {
    fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
    fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
    fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
    fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
    textTransform:
      styles.textTransform === "default" ? undefined : styles.textTransform,
  };
};

const featuredTypographyScopeClass = "yfc-featured-typography";

const featuredTypographyStyles = `
  .${featuredTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${featuredTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${featuredTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${featuredTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${featuredTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${featuredTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${featuredTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${featuredTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${featuredTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${featuredTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const FeaturedComponent: PuckComponent<FeaturedProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextFastCasualFeaturedItemsSection${getAnalyticsScopeHash(props.id)}`;
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const featuredItems = featuredItemsSource.resolveItems(
    props.items,
    streamDocument,
  );
  const sectionForeground = isDarkColor(props.section.backgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const cardForeground = isDarkColor(props.cardBackgroundColor)
    ? "#FFFFFF"
    : "#000000";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${featuredTypographyScopeClass} px-6 py-6 md:px-8 md:py-8`}
          style={{
            backgroundColor: themeColorToCss(props.section.backgroundColor),
          }}
        >
          <style>{featuredTypographyStyles}</style>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="text-left text-[34px] font-bold leading-none md:text-[44px] lg:text-center"
                style={{
                  ...textStylesToCss(props.heading.styles),
                  color: resolveTextColor(
                    props.heading.fontColor,
                    sectionForeground,
                  ),
                }}
              >
                {headingText}
              </h2>
            </EntityField>
            <EntityField
              displayName="Featured Items"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              {featuredItems.map((item, index) => {
                const resolvedImage = item.image;
                const titleText = item.title
                  ? toRenderableText(
                      resolveComponentData(item.title, locale, streamDocument),
                    )
                  : "";
                const descriptionRichTextStyleOverrides = {
                  ...textStylesToCss(props.description?.styles),
                  color: resolveTextColor(
                    props.description?.fontColor,
                    cardForeground,
                  ),
                };
                const description = item.description
                  ? resolveComponentData(
                      item.description,
                      locale,
                      streamDocument,
                      {
                        richTextStyleOverrides:
                          descriptionRichTextStyleOverrides,
                      },
                    )
                  : undefined;
                const isReversed = index % 2 === 0;
                const titleStyle = {
                  ...textStylesToCss(props.title?.styles),
                  color: resolveTextColor(
                    props.title?.fontColor,
                    cardForeground,
                  ),
                };
                const imageBorderRadius = resolveImageBorderRadius(
                  props.image?.styles?.borderRadius,
                );
                const itemBorderRadiusStyles = {
                  "--featured-card-radius": imageBorderRadius,
                } as React.CSSProperties;

                return (
                  <div
                    key={`${titleText}-${index}`}
                    className="grid gap-0 lg:grid-cols-2 lg:gap-4"
                  >
                    <div className={isReversed ? "lg:order-2" : ""}>
                      <div
                        className="grid min-h-0 gap-[20px] rounded-t-[var(--featured-card-radius)] rounded-b-none px-5 py-5 lg:h-full lg:rounded-[var(--featured-card-radius)] lg:px-7 lg:py-7"
                        style={{
                          backgroundColor: themeColorToCss(
                            props.cardBackgroundColor,
                          ),
                          ...itemBorderRadiusStyles,
                        }}
                      >
                        <h3
                          className="mb-3 text-[28px] font-bold leading-tight md:text-[32px]"
                          style={{ ...titleStyle }}
                        >
                          {titleText}
                        </h3>
                        <div className="min-h-0 overflow-visible">
                          {React.isValidElement(description) ? (
                            description
                          ) : (
                            <MaybeRTF
                              data={
                                typeof description === "string"
                                  ? description
                                  : undefined
                              }
                              richTextStyleOverrides={
                                descriptionRichTextStyleOverrides
                              }
                              className="text-[15px] leading-6"
                            />
                          )}
                        </div>
                        {item.cta ? (
                          <div className="shrink-0">
                            <ComprehensiveCTA
                              value={toRenderableCTA(item.cta, props.cta)}
                              eventName={`cardCta${index}`}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={`relative h-full min-h-[280px] ${isReversed ? "lg:order-1" : ""}`}
                    >
                      {resolvedImage ? (
                        <div
                          className="absolute inset-0 overflow-hidden rounded-b-[var(--featured-card-radius)] rounded-t-none lg:rounded-[var(--featured-card-radius)]"
                          style={itemBorderRadiusStyles}
                        >
                          <Image
                            image={resolvedImage}
                            className="h-full w-full object-cover"
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </EntityField>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualFeaturedItemsSection: YextComponentConfig<FeaturedProps> =
  {
    label: "Featured Items Section",
    fields: toPuckFields(FeaturedFields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: { defaultValue: "Featured Items" },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      title: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      description: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      image: {
        styles: {
          borderRadius: "12px",
        },
      },
      cardBackgroundColor: {
        selectedColor: "palette-quaternary-light",
        contrastingColor: "palette-quaternary-light-contrast",
      },
      items: featuredItemsSource.defaultValue,
      cta: {
        variant: "secondary",
        color: undefined,
      },
    },
    render: (props) => <FeaturedComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "FastCasualFeaturedItemsSection",
  displayName: "Featured Items Section",
  description: "Featured Items Section",
  pageSetTypes: ["ENTITY"],
};
