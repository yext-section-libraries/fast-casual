import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  MaybeRTF,
  StyledTextValue,
  ThemeColor,
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

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqItemsSource = createItemSource<FaqItemFields>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      label: "Question",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    answer: {
      label: "Answer",
      type: "entityField",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
  defaultValues: [
    {
      question: {
        field: "",
        constantValue: {
          defaultValue:
            "Are your dining hours the same as your take-out hours?",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Not always. Our takeout and delivery service may remain available slightly later than dine-in seating, especially on weekends. For the most accurate hours, we recommend checking our online ordering page or giving our [[address.city]] location a quick call before placing your order.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: { defaultValue: "Can I order online?" },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. [[name]] offers online ordering for takeout, curbside pickup, and delivery throughout [[address.city]] and surrounding neighborhoods.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Does this location take reservation?",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. We accept reservations for parties of up to 6 guests based on availability. Larger groups and private dining inquiries can be arranged by contacting our events coordinator directly.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: { defaultValue: "Do you have a kids menu?" },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Absolutely. Our kids menu includes favorites like cheeseburgers, grilled chicken tenders, mac & cheese, and buttered pasta.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do you offer vegetarian or gluten-free options?",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. [[name]] offers vegetarian-friendly menu items and gluten-free buns upon request whenever possible.",
          ),
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type FaqProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  items: typeof faqItemsSource.value;
  question: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  answer: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

const FaqFields: YextFields<FaqProps> = {
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
  items: faqItemsSource.field,
  question: {
    label: "Question",
    type: "object",
    objectFields: {
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  answer: {
    label: "Answer",
    type: "object",
    objectFields: {
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
};

const textStylesToCss = (styles: StyledTextValue) => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const colorValueToCss = (color?: ThemeColor | string) => {
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
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
    case "white":
      return "#FFFFFF";
    default:
      return selectedColor;
  }
};

const themeColorToCss = (color?: ThemeColor | string) => colorValueToCss(color);

const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  fallbackColor: ThemeColor | string,
) => themeColorToCss(fontColor) ?? colorValueToCss(fallbackColor);

const faqTypographyScopeClass = "yfc-faq-typography";

const faqTypographyStyles = `
  .${faqTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${faqTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${faqTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${faqTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${faqTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${faqTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${faqTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${faqTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${faqTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${faqTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const FaqComponent: PuckComponent<FaqProps> = (props) => {
  const analytics = useAnalytics();
  const [openIndex, setOpenIndex] = React.useState(0);
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionForeground = isDarkColor(props.section.backgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const faqItems = faqItemsSource.resolveItems(props.items, streamDocument);
  const scopeName = `YextFastCasualFaqSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${faqTypographyScopeClass} px-6 py-8 md:px-8 md:py-10`}
          style={{
            backgroundColor: themeColorToCss(props.section.backgroundColor),
          }}
        >
          <style>{faqTypographyStyles}</style>
          <div className="mx-auto max-w-[980px]">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="mb-6 text-left text-[34px] font-bold leading-none md:text-[44px] lg:text-center"
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
              displayName="FAQ Items"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              <div
                className={`divide-y ${isDarkColor(props.section.backgroundColor) ? "divide-neutral-200" : "divide-neutral-800"}`}
              >
                {faqItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  const questionText = item.question
                    ? resolveComponentData(
                        item.question,
                        locale,
                        streamDocument,
                      ) || ""
                    : "";
                  const answerValue = item.answer
                    ? resolveComponentData(
                        item.answer,
                        locale,
                        streamDocument,
                        {
                          richTextStyleOverrides: {
                            ...textStylesToCss(props.answer.styles),
                            color: resolveTextColor(
                              props.answer.fontColor,
                              sectionForeground,
                            ),
                          },
                        },
                      )
                    : undefined;

                  return (
                    <article key={`${questionText}-${index}`} className="py-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 text-left text-[16px] font-semibold text-current"
                        aria-expanded={isOpen}
                        onClick={() => {
                          const next = isOpen ? -1 : index;
                          setOpenIndex(next);
                          analytics?.track({
                            action: next === index ? "EXPAND" : "COLLAPSE",
                            eventName: `toggle${index}`,
                          });
                        }}
                        style={{
                          ...textStylesToCss(props.question.styles),
                          color: resolveTextColor(
                            props.question.fontColor,
                            sectionForeground,
                          ),
                        }}
                      >
                        <span>{questionText}</span>
                        <span className="text-xl">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? (
                        <div
                          className="pt-3 text-[14px] leading-6 text-current"
                          style={{
                            color: resolveTextColor(
                              props.answer.fontColor,
                              sectionForeground,
                            ),
                          }}
                        >
                          {React.isValidElement(answerValue) ? (
                            answerValue
                          ) : (
                            <MaybeRTF
                              data={answerValue as string | undefined}
                              richTextStyleOverrides={{
                                ...textStylesToCss(props.answer.styles),
                                color: resolveTextColor(
                                  props.answer.fontColor,
                                  sectionForeground,
                                ),
                              }}
                            />
                          )}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualFaqSection: YextComponentConfig<FaqProps> = {
  label: "Faq Section",
  fields: toPuckFields(FaqFields),
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
        constantValue: { defaultValue: "FAQs" },
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
    items: faqItemsSource.defaultValue,
    question: {
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      fontColor: undefined,
    },
    answer: {
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      fontColor: undefined,
    },
  },
  render: (props) => <FaqComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualFaqSection",
  displayName: "Faq Section",
  description: "Faq Section",
  pageSetTypes: ["ENTITY"],
};
