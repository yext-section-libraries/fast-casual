import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveBreadcrumbs,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

type BreadcrumbsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  rootLabel: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  includeCurrentLocation: boolean;
};

const fields: YextFields<BreadcrumbsProps> = {
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
  rootLabel: {
    label: "Root Label",
    type: "object",
    objectFields: {
      text: {
        label: "Text",
        type: "entityField",
        filter: { types: ["type.string"] },
      },
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
  includeCurrentLocation: {
    label: "Include Current Location",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const getThemeColorCssValue = (color?: ThemeColor): string | undefined => {
  switch (color?.selectedColor) {
    case "palette-primary":
      return "var(--colors-palette-primary)";
    case "palette-secondary":
      return "var(--colors-palette-secondary)";
    case "palette-tertiary":
      return "var(--colors-palette-tertiary)";
    case "palette-quaternary":
      return "var(--colors-palette-quaternary)";
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
    case "black":
      return "#000000";
    default:
      return color?.selectedColor;
  }
};

/** Renders directory breadcrumbs using the current location's resolved hierarchy. */
const BreadcrumbsComponent: PuckComponent<BreadcrumbsProps> = (props) => {
  const streamDocument = useDocument();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const rootLabel =
    resolveComponentData(props.rootLabel.text, locale, streamDocument) || "";
  const currentLocation = streamDocument.name ?? "";
  const scopeName = `YextFastCasualBreadcrumbs${getAnalyticsScopeHash(props.id)}`;
  const textColor =
    getThemeColorCssValue(props.rootLabel.fontColor) ??
    getThemeColorCssValue({
      selectedColor: props.section.backgroundColor.contrastingColor,
      contrastingColor: props.section.backgroundColor.selectedColor,
    });
  const textStyle: React.CSSProperties = {
    color: textColor,
    fontFamily:
      props.rootLabel.styles.fontFamily === "default"
        ? undefined
        : props.rootLabel.styles.fontFamily,
    fontSize:
      props.rootLabel.styles.fontSize === "default"
        ? undefined
        : props.rootLabel.styles.fontSize,
    fontWeight:
      props.rootLabel.styles.fontWeight === "default"
        ? undefined
        : props.rootLabel.styles.fontWeight,
    fontStyle:
      props.rootLabel.styles.fontStyle === "default"
        ? undefined
        : props.rootLabel.styles.fontStyle,
    textTransform:
      props.rootLabel.styles.textTransform === "default"
        ? undefined
        : props.rootLabel.styles.textTransform,
  };

  if (!breadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <nav
          aria-label="Breadcrumb"
          className="px-6 py-3 md:px-10 lg:px-12"
          style={getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          )}
        >
          <ol
            className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-2 gap-y-1 text-sm"
            style={textStyle}
          >
            {breadcrumbs.map(({ name, slug }, index) => {
              const isRoot = index === 0;
              const isCurrent = index === breadcrumbs.length - 1;
              const label = isRoot && rootLabel ? rootLabel : name;

              if (isCurrent && !isRoot && props.includeCurrentLocation) {
                return (
                  <li key={index} className="flex items-center gap-x-2">
                    <span aria-hidden="true">/</span>
                    <EntityField
                      displayName="Current Location"
                      fieldId="name"
                      constantValueEnabled={false}
                    >
                      <span aria-current="page">{currentLocation || name}</span>
                    </EntityField>
                  </li>
                );
              }

              if (isCurrent && !isRoot) {
                return null;
              }

              return (
                <li key={index} className="flex items-center gap-x-2">
                  {!isRoot && <span aria-hidden="true">/</span>}
                  {isRoot ? (
                    <EntityField
                      displayName="Root Label"
                      fieldId={props.rootLabel.text.field}
                      constantValueEnabled={
                        props.rootLabel.text.constantValueEnabled
                      }
                    >
                      <Link
                        cta={{
                          link: relativePrefixToRoot
                            ? relativePrefixToRoot + slug
                            : slug,
                          linkType: "URL",
                        }}
                        eventName={`breadcrumb${index}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {label}
                      </Link>
                    </EntityField>
                  ) : (
                    <Link
                      cta={{
                        link: relativePrefixToRoot
                          ? relativePrefixToRoot + slug
                          : slug,
                        linkType: "URL",
                      }}
                      eventName={`breadcrumb${index}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualBreadcrumbs: YextComponentConfig<BreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    render: BreadcrumbsComponent,
    fields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      rootLabel: {
        text: {
          field: "",
          constantValue: { defaultValue: "Locations" },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      includeCurrentLocation: true,
    },
  };

export const config: SectionConfig = {
  id: "FastCasualBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
