import type { SectionConfig } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  resolveTextColor,
} from "../shared/styleHelpers";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  getAnalyticsScopeHash,
  Image,
  StyledTextComponent,
  StyledTextValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableRichText,
  TranslatableString,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  resolveComponentData,
  useDocument,
  BackgroundProvider,
  getDefaultForegroundColor,
  getSurfaceColorStyle,
  isDarkColor,
} from "@yext/visual-editor";

type EventsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  backgroundImage: {
    image: YextEntityField<TranslatableAssetImage>;
  };
  overlayBackgroundColor: ThemeColor;
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  description: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  cta: ComprehensiveCTAValue;
};

const EventsFields: YextFields<EventsProps> = {
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
  overlayBackgroundColor: {
    label: "Overlay Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  backgroundImage: {
    label: "Background Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
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
        type: "entityField",
        label: "Text",
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
  cta: {
    label: "Call to Action",
    type: "comprehensiveCTA",
  },
};

const makeTextStyles = (): StyledTextValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
});

const makeCta = (): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: "Learn More",
        link: "#",
        openInNewTab: false,
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
  },
  styles: {
    variant: "primary",
  },
});

const eventsTypographyScopeClass = "yfc-events-typography";

const eventsTypographyStyles = getScopedTypographyStyles(
  eventsTypographyScopeClass,
);

const EventsComponent: PuckComponent<EventsProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = getDefaultForegroundColor(
    props.overlayBackgroundColor,
    streamDocument,
  );
  const overlayStyle = getSurfaceColorStyle(
    props.overlayBackgroundColor,
    streamDocument,
    { fallbackBackgroundColor: "#000000" },
  );
  const resolvedImage = resolveComponentData(
    props.backgroundImage.image,
    locale,
    streamDocument,
  );
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const scopeName = `YextFastCasualEventsSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${eventsTypographyScopeClass} relative isolate overflow-hidden px-0 py-8 lg:px-8`}
          style={sectionStyle}
        >
          <style>{eventsTypographyStyles}</style>
          {resolvedImage ? (
            <EntityField
              displayName="Background Image"
              fieldId={props.backgroundImage.image.field}
              constantValueEnabled={
                props.backgroundImage.image.constantValueEnabled
              }
            >
              <div className="absolute inset-y-8 left-0 w-full lg:left-1/2 lg:w-[calc(100%-4rem)] lg:max-w-[1440px] lg:-translate-x-1/2">
                <Image
                  image={resolvedImage}
                  className="h-full w-full object-cover lg:rounded-[14px]"
                />
              </div>
            </EntityField>
          ) : null}
          <div
            className="absolute inset-y-8 left-0 w-full lg:left-1/2 lg:w-[calc(100%-4rem)] lg:max-w-[1440px] lg:-translate-x-1/2 lg:rounded-[14px]"
            style={{ ...overlayStyle, opacity: 0.55 }}
          />
          <div className="relative mx-auto flex min-h-[420px] max-w-[900px] flex-col items-start justify-center px-6 py-10 text-left md:px-8 lg:items-center lg:text-center">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="mb-4 text-[36px] font-bold leading-[1.05] md:text-[50px]"
                style={{
                  ...getTextStyle(props.heading.styles),
                  color: resolveTextColor(
                    props.heading.fontColor,
                    sectionForeground ?? "white",
                  ),
                }}
              >
                {headingText}
              </h2>
            </EntityField>
            <div className="max-w-[620px] text-[15px] leading-6 md:text-[16px]">
              <StyledTextComponent
                data={{ text: props.description.text }}
                fontOptions={{
                  ...props.description.styles,
                  color: props.description.fontColor ?? sectionForeground,
                }}
                kind="richText"
              />
            </div>
            <div className="pt-[30px]">
              <BackgroundProvider
                value={{
                  ...props.overlayBackgroundColor,
                  isDarkColor: isDarkColor(props.overlayBackgroundColor),
                }}
              >
                <EntityField
                  displayName="Call to Action"
                  fieldId={props.cta.data.cta.field}
                  constantValueEnabled={props.cta.data.cta.constantValueEnabled}
                >
                  <ComprehensiveCTA
                    value={props.cta as Partial<ComprehensiveCTAValue>}
                    eventName="primaryCta"
                  />
                </EntityField>
              </BackgroundProvider>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualEventsSection: YextComponentConfig<EventsProps> = {
  label: "Events Section",
  fields: EventsFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      visibleOnLivePage: true,
    },
    backgroundImage: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
    },
    overlayBackgroundColor: {
      selectedColor: "[#000000]",
      contrastingColor: "white",
      isDarkColor: true,
    },
    heading: {
      text: {
        field: "",
        constantValue: {
          defaultValue: "Host Your Next Group Event at [[name]]",
        },
        constantValueEnabled: true,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
    description: {
      text: {
        field: "",
        constantValue: {
          defaultValue: {
            html: "<p>Planning a birthday dinner, team happy hour, or weekend gathering in [[address.city]]? [[name]] makes group dining easy.</p><ul><li>Indoor + patio seating available</li><li>Customizable food &amp; cocktail packages</li><li>Convenient onsite parking in [[geomodifier]] [[address.city]]</li><li>Flexible group size accommodations from 10-150 guests</li></ul>",
            json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Planning a birthday dinner, team happy hour, or weekend gathering in [[address.city]]? [[name]] makes group dining easy.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Indoor + patio seating available","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Customizable food & cocktail packages","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":2,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Convenient onsite parking in [[geomodifier]] [[address.city]]","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":3,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Flexible group size accommodations from 10-150 guests","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":4,"version":1}],"direction":"ltr","format":"","indent":0,"listType":"bullet","start":1,"tag":"ul","type":"list","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          },
        },
        constantValueEnabled: true,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
    cta: makeCta(),
  },
  render: (props) => <EventsComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualEventsSection",
  displayName: "Events Section",
  description: "Events Section",
  pageSetTypes: ["ENTITY"],
};
