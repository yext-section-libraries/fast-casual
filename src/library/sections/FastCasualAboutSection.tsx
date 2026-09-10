import type { SectionConfig } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  resolveTextColor,
} from "../shared/styleHelpers";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getSurfaceColorStyle,
  StyledTextComponent,
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

const aboutTypographyScopeClass = "yfc-about-typography";

const aboutTypographyStyles = getScopedTypographyStyles(
  aboutTypographyScopeClass,
);

const AboutComponent: PuckComponent<AboutProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "#000000";
  const eyebrowText =
    resolveComponentData(props.eyebrow.text, locale, streamDocument) || "";
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const scopeName = `YextFastCasualAboutSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${aboutTypographyScopeClass} px-6 py-10 md:px-8 md:py-12`}
          style={sectionStyle}
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
                      ...getTextStyle(props.eyebrow.styles),
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
              </div>
              {props.description ? (
                <StyledTextComponent
                  data={{ text: props.description.text }}
                  fontOptions={{
                    ...props.description.styles,
                    color:
                      props.description.fontColor ??
                      getDefaultForegroundColor(
                        props.section.backgroundColor,
                        streamDocument,
                      ),
                  }}
                  kind="richText"
                />
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
