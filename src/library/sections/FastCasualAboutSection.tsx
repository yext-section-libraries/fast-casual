import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  MaybeRTF,
  StyledTextValue,
  ThemeColor,
  TranslatableRichText,
  TranslatableString,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  isDarkColor,
} from "@yext/visual-editor";

type AboutProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  eyebrow: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  description?: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

const AboutFields: YextFields<AboutProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  eyebrow: {
    label: "Eyebrow",
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
  description: {
    label: "Description",
    type: "object",
    objectFields: {
      text: {
        label: "Text",
        type: "entityField",
        filter: { types: ["type.rich_text_v2"] },
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
};

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

const colorValueToCss = (color?: string) => {
  if (!color) {
    return undefined;
  }

  if (color.startsWith("[") && color.endsWith("]")) {
    return color.slice(1, -1);
  }

  switch (color) {
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
      return color;
  }
};

const themeColorToCss = (color?: ThemeColor) =>
  colorValueToCss(color?.selectedColor);

const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  fallbackColor: string,
) => themeColorToCss(fontColor) ?? colorValueToCss(fallbackColor);

const aboutTypographyScopeClass = "yfc-about-typography";

const aboutTypographyStyles = `
  .${aboutTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${aboutTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${aboutTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${aboutTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${aboutTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${aboutTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${aboutTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${aboutTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${aboutTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${aboutTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const AboutComponent: PuckComponent<AboutProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionForeground = isDarkColor(props.section.backgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const eyebrowText =
    resolveComponentData(props.eyebrow.text, locale, streamDocument) || "";
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const descriptionTextStyles = props.description
    ? {
        ...textStylesToCss(props.description.styles),
        color: resolveTextColor(props.description.fontColor, sectionForeground),
      }
    : undefined;
  const description = props.description
    ? resolveComponentData(props.description.text, locale, streamDocument, {
        richTextStyleOverrides: descriptionTextStyles,
      })
    : undefined;
  const scopeName = `YextFastCasualAboutSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${aboutTypographyScopeClass} px-6 py-10 md:px-8 md:py-12`}
          style={{
            backgroundColor: themeColorToCss(props.section.backgroundColor),
          }}
        >
          <style>{aboutTypographyStyles}</style>
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
              <div className="lg:max-w-[300px]">
                <EntityField
                  displayName="Eyebrow"
                  fieldId={props.eyebrow.text.field}
                  constantValueEnabled={props.eyebrow.text.constantValueEnabled}
                >
                  <p
                    className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      ...textStylesToCss(props.eyebrow.styles),
                      color: resolveTextColor(
                        props.eyebrow.fontColor,
                        sectionForeground,
                      ),
                    }}
                  >
                    {eyebrowText}
                  </p>
                </EntityField>
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2
                    className="text-[34px] font-bold leading-[1.05] md:text-[46px]"
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
              </div>
              {props.description ? (
                <EntityField
                  displayName="Description"
                  fieldId={props.description.text.field}
                  constantValueEnabled={
                    props.description.text.constantValueEnabled
                  }
                >
                  {React.isValidElement(description) ? (
                    description
                  ) : (
                    <MaybeRTF
                      data={
                        typeof description === "string"
                          ? description
                          : undefined
                      }
                      richTextStyleOverrides={descriptionTextStyles}
                    />
                  )}
                </EntityField>
              ) : null}
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualAboutSection: YextComponentConfig<AboutProps> = {
  label: "About Section",
  fields: AboutFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      visibleOnLivePage: true,
    },
    eyebrow: {
      text: {
        field: "",
        constantValue: { defaultValue: "About us" },
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
    heading: {
      text: {
        field: "",
        constantValue: { defaultValue: "What is [[name]]?" },
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
    description: {
      text: {
        field: "",
        constantValue: {
          defaultValue: {
            json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"At [[name]], we believe great burgers start with great ingredients and a sense of place. Nestled in the heart of [[address.city]], our burger restaurant brings together wood-fired flavor, chef-driven comfort food, and the laid-back energy that makes [[address.region]] unforgettable.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"From locally sourced beef and scratch-made sauces to craft cocktails and rotating [[address.region]] drafts, every detail is designed for guests who appreciate elevated casual dining without the pretension. Whether you\'re grabbing brunch before exploring Barton Springs or meeting friends for happy hour, [[name]] feels distinctly [[address.city]].","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Conveniently located at [[address.line1]] near [[geomodifier]] [[address.city]], [[name]] offers dine-in, curbside pickup, delivery, and private group accommodations for locals and visitors looking for one of the best upscale burger restaurants in [[address.city]], [[address.region]].","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
            html: "<p>At [[name]], we believe great burgers start with great ingredients and a sense of place. Nestled in the heart of [[address.city]], our burger restaurant brings together wood-fired flavor, chef-driven comfort food, and the laid-back energy that makes [[address.region]] unforgettable.</p><p>From locally sourced beef and scratch-made sauces to craft cocktails and rotating [[address.region]] drafts, every detail is designed for guests who appreciate elevated casual dining without the pretension. Whether you're grabbing brunch before exploring Barton Springs or meeting friends for happy hour, [[name]] feels distinctly [[address.city]].</p><p>Conveniently located at [[address.line1]] near [[geomodifier]] [[address.city]], [[name]] offers dine-in, curbside pickup, delivery, and private group accommodations for locals and visitors looking for one of the best upscale burger restaurants in [[address.city]], [[address.region]].</p>",
          },
        },
        constantValueEnabled: true,
      } satisfies YextEntityField<TranslatableRichText>,
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
  render: (props) => <AboutComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualAboutSection",
  displayName: "About Section",
  description: "About Section",
  pageSetTypes: ["ENTITY"],
};
