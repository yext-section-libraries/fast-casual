import type { SectionConfig } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
} from "../shared/styleHelpers";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  getDefaultForegroundColor,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  StyledTextComponent,
  StyledTextValue,
  ThemeColor,
  TranslatableRichText,
  useDocument,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
} from "@yext/visual-editor";

type IntroProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  body: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

const IntroFields: YextFields<IntroProps> = {
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
  body: {
    label: "Body",
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
};

const introTypographyScopeClass = "yfc-intro-typography";

const introTypographyStyles = getScopedTypographyStyles(
  introTypographyScopeClass,
);

const IntroComponent: PuckComponent<IntroProps> = (props) => {
  const streamDocument = useDocument();
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const scopeName = `YextFastCasualIntroSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${introTypographyScopeClass} px-6 py-5 text-center text-white md:px-10`}
          style={sectionStyle}
        >
          <style>{introTypographyStyles}</style>
          <div className="mx-auto max-w-[760px]">
            <StyledTextComponent
              data={{ text: props.body.text }}
              fontOptions={{
                ...props.body.styles,
                color:
                  props.body.fontColor ??
                  getDefaultForegroundColor(
                    props.section.backgroundColor,
                    streamDocument,
                  ),
              }}
              kind="richText"
            />
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualIntroSection: YextComponentConfig<IntroProps> = {
  label: "Intro Section",
  fields: IntroFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      visibleOnLivePage: true,
    },
    body: {
      text: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "[[name]] is an upscale burger restaurant located in [[address.city]], [[address.region]]. They offer dine-in, takeout, delivery, and curbside pickup options. The location serves lunch, dinner, and brunch, with happy hour available on weekdays.",
          ),
          hasLocalizedValue: "true",
        },
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
  },
  render: (props) => <IntroComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualIntroSection",
  displayName: "Intro Section",
  description: "Intro Section",
  pageSetTypes: ["ENTITY"],
};
