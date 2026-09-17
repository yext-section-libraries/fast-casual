import type { SectionConfig } from "@yext/visual-editor";
import { msg } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getRichTextValue,
  getTextStyle,
  getThemeColorCssValue,
  resolveTextColor,
} from "../shared/styleHelpers";

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
  useDocument,
  isDarkColor,
} from "@yext/visual-editor";

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqItemsSource = createItemSource<FaqItemFields>({
  label: msg("fields.faqItems", "FAQ Items"),
  mappingFields: {
    question: {
      label: msg("fields.question", "Question"),
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    answer: {
      label: msg("fields.answer", "Answer"),
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
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
    },
  },
  items: faqItemsSource.field,
  question: {
    label: msg("fields.question", "Question"),
    type: "object",
    objectFields: {
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  answer: {
    label: msg("fields.answer", "Answer"),
    type: "object",
    objectFields: {
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
};

const faqTypographyScopeClass = "yfc-faq-typography";

const faqTypographyStyles = getScopedTypographyStyles(
  faqTypographyScopeClass,
);

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
            backgroundColor: getThemeColorCssValue(props.section.backgroundColor),
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
                  ...getTextStyle(props.heading.styles),
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
                  const answerValue = getRichTextValue(item.answer, locale);

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
                          ...getTextStyle(props.question.styles),
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
                          <MaybeRTF
                            data={answerValue}
                            richTextStyleOverrides={{
                              ...getTextStyle(props.answer.styles),
                              color: resolveTextColor(
                                props.answer.fontColor,
                                sectionForeground,
                              ),
                            }}
                          />
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
  label: msg("components.faqSection", "Faq Section"),
  fields: FaqFields,
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
