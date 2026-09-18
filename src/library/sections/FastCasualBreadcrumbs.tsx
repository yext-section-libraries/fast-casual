import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  getTextStyle,
  getThemeColorCssValue,
} from "../shared/styleHelpers";

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
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  rootLabel: {
    label: msg("fields.rootLabel", "Root Label"),
    type: "object",
    objectFields: {
      text: {
        label: msg("fields.text", "Text"),
        type: "entityField",
        filter: { types: ["type.string"] },
      },
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
  includeCurrentLocation: {
    label: msg("fields.includeCurrentLocation", "Include Current Location"),
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  },
};

/** Renders directory breadcrumbs using the current location's resolved hierarchy. */
const BreadcrumbsComponent: PuckComponent<BreadcrumbsProps> = (props) => {
  const { t } = useTranslation();
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
    ...getTextStyle(props.rootLabel.styles),
    color: textColor,
  };

  if (!breadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        {pt(
          "noBreadcrumbsAvailable",
          "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
        )}
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
          aria-label={t("breadcrumb", "Breadcrumb")}
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
    label: msg("components.breadcrumbs", "Breadcrumbs"),
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
