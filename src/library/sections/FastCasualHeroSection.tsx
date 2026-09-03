import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  AnalyticsScopeProvider,
  type HoursType,
  HoursStatus,
  type StatusParams,
} from "@yext/pages-components";
import {
  EntityField,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  getAggregateRating,
  getAnalyticsScopeHash,
  Image,
  StyledTextValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableString,
  isDarkColor,
  useDocument,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  i18nComponentsInstance,
  resolveComponentData,
} from "@yext/visual-editor";

type HeroProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heroImage: {
    image: YextEntityField<TranslatableAssetImage>;
  };
  brandName: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  geomodifier: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  hours: YextEntityField<HoursType>;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
    showDayNames: boolean;
  };
  actions: {
    cta: ComprehensiveCTAValue;
  }[];
};

type HeroDocument = Record<string, unknown> & {
  locale?: string;
  comingSoon?: boolean;
  timezone?: string;
};

const maxSummaryLength = 40;

const truncateSummary = (value: string): string =>
  value.length > maxSummaryLength
    ? `${value.slice(0, maxSummaryLength - 1).trimEnd()}…`
    : value;

const getEditableSummary = (value: unknown, fallback: string): string => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue ? truncateSummary(trimmedValue) : fallback;
  }

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const resolvedValue = resolveComponentData(
    value as TranslatableString,
    i18nComponentsInstance.language,
    undefined,
  );
  if (typeof resolvedValue === "string") {
    const trimmedValue = resolvedValue.trim();
    return trimmedValue ? truncateSummary(trimmedValue) : fallback;
  }

  const defaultValue =
    "defaultValue" in value
      ? getEditableSummary(
          (value as { defaultValue?: unknown }).defaultValue,
          "",
        )
      : "";
  return defaultValue || fallback;
};

const getCtaSummary = (
  cta:
    | {
        data?: {
          cta?: {
            constantValue?: {
              label?: unknown;
            };
          };
        };
      }
    | undefined,
  fallback: string,
): string => getEditableSummary(cta?.data?.cta?.constantValue?.label, fallback);

const HeroFields: YextFields<HeroProps> = {
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
  heroImage: {
    label: "Hero Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
      },
    },
  },
  brandName: {
    label: "Brand Name",
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
  geomodifier: {
    label: "Geomodifier",
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
  hours: {
    type: "entityField",
    label: "Hours",
    filter: { types: ["type.hours"] },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: "Show Current Status",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      timeFormat: {
        label: "Time Format",
        type: "select",
        options: [
          { label: "12 Hour", value: "12h" },
          { label: "24 Hour", value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: "Day Of Week Format",
        type: "select",
        options: [
          { label: "Short", value: "short" },
          { label: "Long", value: "long" },
        ],
      },
      showDayNames: {
        label: "Show Day Names",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  actions: {
    label: "Actions",
    type: "array",
    arrayFields: {
      cta: {
        label: "Call to Action",
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: "Call Ahead",
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
      },
    },
    getItemSummary: (item) => getCtaSummary(item.cta, "Action"),
  },
};

const heroTypographyScopeClass = "yfc-hero-typography";

const heroTypographyStyles = `
  .${heroTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${heroTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${heroTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${heroTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${heroTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${heroTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${heroTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${heroTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${heroTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${heroTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const textStylesToCss = (styles: StyledTextValue) => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

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
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
    case "palette-primary-dark":
      return "hsl(from var(--colors-palette-primary) h s 20)";
    case "palette-secondary-dark":
      return "hsl(from var(--colors-palette-secondary) h s 20)";
    case "palette-primary-contrast":
      return "var(--colors-palette-primary-contrast)";
    case "palette-secondary-contrast":
      return "var(--colors-palette-secondary-contrast)";
    case "palette-tertiary-contrast":
      return "var(--colors-palette-tertiary-contrast)";
    case "palette-quaternary-contrast":
      return "var(--colors-palette-quaternary-contrast)";
    case "white":
      return "#FFFFFF";
    case "black":
      return "#000000";
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

const getDefaultCTAColor = (isDarkBackground: boolean): ThemeColor =>
  isDarkBackground
    ? {
        selectedColor: "white",
        contrastingColor: "black",
      }
    : {
        selectedColor: "black",
        contrastingColor: "white",
      };

const toRenderableCTA = (cta: {
  data: ComprehensiveCTAValue["data"];
  styles: ComprehensiveCTAValue["styles"];
  className?: string;
  defaultColor: ThemeColor;
}): Partial<ComprehensiveCTAValue> => ({
  data: cta.data,
  styles: {
    ...cta.styles,
    variant: cta.styles.variant ?? "primary",
    color: cta.styles.color ?? cta.defaultColor,
  },
  className: cta.className,
});

const renderStarRating = (rating: number): string => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(roundedRating)}${"☆".repeat(5 - roundedRating)}`;
};

const isResolvedImage = (value: unknown): value is TranslatableAssetImage => {
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    "url" in value
  );
};

const isResolvedHours = (value: unknown): value is HoursType => {
  return (
    typeof value === "object" && value !== null && !React.isValidElement(value)
  );
};

const HeroComponent: PuckComponent<HeroProps> = (props) => {
  const streamDocument = useDocument<HeroDocument>();
  const locale = streamDocument.locale ?? "en";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const ratingValue = typeof averageRating === "number" ? averageRating : 0;
  const ratingCount = typeof reviewCount === "number" ? reviewCount : 0;
  const rawHeroImage = resolveComponentData(
    props.heroImage.image,
    locale,
    streamDocument,
  );
  const resolvedHeroImage = isResolvedImage(rawHeroImage)
    ? rawHeroImage
    : undefined;
  const brandName =
    resolveComponentData(props.brandName.text, locale, streamDocument) || "";
  const geomodifier =
    resolveComponentData(props.geomodifier.text, locale, streamDocument) || "";
  const rawHours = resolveComponentData(props.hours, locale, streamDocument);
  const resolvedHours = isResolvedHours(rawHours) ? rawHours : undefined;
  const scopeName = `YextFastCasualHeroSection${getAnalyticsScopeHash(props.id)}`;
  const panelBackground = themeColorToCss(props.section.backgroundColor);

  const panelIsDark = isDarkColor(
    props.section.backgroundColor,
    streamDocument,
  );
  const heroTextColor =
    resolveTextColor(
      props.brandName.fontColor,
      props.section.backgroundColor.contrastingColor,
    ) ?? (panelIsDark ? "#FFFFFF" : "#000000");
  const heroHeadingColor =
    resolveTextColor(
      props.geomodifier.fontColor,
      props.section.backgroundColor.contrastingColor,
    ) ?? (panelIsDark ? "#FFFFFF" : "#000000");
  const defaultCTAColor = getDefaultCTAColor(panelIsDark);

  const renderStatus = (statusProps: StatusParams) => {
    const interval = statusProps.isOpen
      ? statusProps.currentInterval
      : statusProps.futureInterval;
    const time = statusProps.isOpen
      ? interval?.getEndTime(locale, statusProps.timeOptions)
      : interval?.getStartTime(locale, statusProps.timeOptions);
    const showDay = props.hoursStyles.showDayNames && interval;
    const dayText =
      showDay && interval
        ? statusProps.isOpen
          ? interval.end
              ?.setLocale(locale)
              .toLocaleString(statusProps.dayOptions)
          : interval.start
              ?.setLocale(locale)
              .toLocaleString(statusProps.dayOptions)
        : "";
    const futureText = time
      ? statusProps.isOpen
        ? `Closes at ${time}${dayText ? ` ${dayText}` : ""}`
        : `Opens at ${time}${dayText ? ` ${dayText}` : ""}`
      : "";

    return (
      <div
        className="flex w-full flex-wrap items-center justify-center gap-2 text-center text-[12px] font-medium uppercase tracking-[0.08em]"
        style={{ color: heroTextColor }}
      >
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold"
          style={{
            backgroundColor:
              themeColorToCss(defaultCTAColor) ??
              (panelIsDark ? "#FFFFFF" : "#000000"),
            color:
              colorValueToCss(defaultCTAColor.contrastingColor) ??
              (panelIsDark ? "#000000" : "#FFFFFF"),
          }}
        >
          {statusProps.isOpen ? "Open Now" : "Closed"}
        </span>
        {futureText ? (
          <span className="text-[11px] tracking-[0.02em]">{futureText}</span>
        ) : null}
      </div>
    );
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${heroTypographyScopeClass} relative isolate overflow-hidden`}
        >
          <style>{heroTypographyStyles}</style>
          {resolvedHeroImage ? (
            <EntityField
              displayName="Hero Image"
              fieldId={props.heroImage.image.field}
              constantValueEnabled={props.heroImage.image.constantValueEnabled}
            >
              <div className="absolute inset-0">
                <Image
                  image={resolvedHeroImage}
                  className="h-full w-full object-cover"
                />
              </div>
            </EntityField>
          ) : null}
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] items-center justify-center px-6 pb-10 pt-28 md:min-h-[560px] md:px-10 lg:px-16">
            <div
              className="w-full max-w-[640px] rounded-[18px] border border-white/10 px-5 py-6 text-center shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-7 md:py-7"
              style={{
                backgroundColor: panelBackground,
                opacity: "72%",
              }}
            >
              <EntityField
                displayName="Brand Name"
                fieldId={props.brandName.text.field}
                constantValueEnabled={props.brandName.text.constantValueEnabled}
              >
                <p
                  className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    ...textStylesToCss(props.brandName.styles),
                    color: heroTextColor,
                  }}
                >
                  {brandName}
                </p>
              </EntityField>
              <EntityField
                displayName="Geomodifier"
                fieldId={props.geomodifier.text.field}
                constantValueEnabled={
                  props.geomodifier.text.constantValueEnabled
                }
              >
                <h1
                  className="mb-3 text-[38px] font-bold uppercase leading-none md:text-[46px]"
                  style={{
                    ...textStylesToCss(props.geomodifier.styles),
                    color: heroHeadingColor,
                  }}
                >
                  {geomodifier}
                </h1>
              </EntityField>
              {reviewCount > 0 && (
                <EntityField
                  displayName="Review Summary"
                  fieldId="ref_reviewsAgg"
                  constantValueEnabled={false}
                >
                  <div
                    className="mb-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold md:text-[12px]"
                    style={{ color: heroTextColor }}
                  >
                    <span>{ratingValue.toFixed(1)} Stars</span>
                    <span className="text-[14px] tracking-[0.12em]">
                      {renderStarRating(ratingValue)}
                    </span>
                    <span
                      className="h-3 w-px"
                      style={{
                        backgroundColor: heroTextColor,
                        opacity: 0.5,
                      }}
                    />
                    <span>{ratingCount} Reviews</span>
                  </div>
                </EntityField>
              )}
              {resolvedHours ? (
                <EntityField
                  displayName="Hours"
                  fieldId={props.hours.field}
                  constantValueEnabled={props.hours.constantValueEnabled}
                >
                  <div className="flex justify-center">
                    {props.hoursStyles.showCurrentStatus ? (
                      <HoursStatus
                        hours={resolvedHours}
                        comingSoon={streamDocument.comingSoon}
                        timezone={streamDocument.timezone ?? "UTC"}
                        dayOptions={{
                          weekday: props.hoursStyles.dayOfWeekFormat,
                        }}
                        timeOptions={{
                          hour12: props.hoursStyles.timeFormat === "12h",
                        }}
                        statusTemplate={renderStatus}
                      />
                    ) : null}
                  </div>
                </EntityField>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap  sm:justify-around sm:gap-4">
                {(props.actions ?? []).map((action, index) => (
                  <div key={index} className="flex w-full sm:w-auto">
                    <EntityField
                      displayName={`Action ${index + 1}`}
                      fieldId={action.cta.data.cta.field}
                      constantValueEnabled={
                        action.cta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={toRenderableCTA({
                          data: action.cta.data,
                          styles: action.cta.styles,
                          className: action.cta.className,
                          defaultColor: defaultCTAColor,
                        })}
                        eventName={`primaryCta${index}`}
                        className="flex min-h-[46px] w-full items-center justify-center text-center no-underline transition"
                      />
                    </EntityField>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualHeroSection: YextComponentConfig<HeroProps> = {
  label: "Hero Section",
  fields: HeroFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      visibleOnLivePage: true,
    },
    heroImage: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
          width: 1900,
          height: 1267,
        },
        constantValueEnabled: true,
      },
    },
    brandName: {
      text: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
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
    geomodifier: {
      text: {
        field: "geomodifier",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
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
    hours: {
      field: "hours",
      constantValue: {},
      constantValueEnabled: false,
    },
    hoursStyles: {
      showCurrentStatus: true,
      timeFormat: "12h",
      dayOfWeekFormat: "long",
      showDayNames: false,
    },
    actions: [
      {
        cta: {
          data: {
            actionType: "link",
            cta: {
              field: "",
              constantValue: {
                label: "Call Ahead",
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
        },
      },
      {
        cta: {
          data: {
            actionType: "link",
            cta: {
              field: "",
              constantValue: {
                label: "Order Takeout",
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
        },
      },
      {
        cta: {
          data: {
            actionType: "link",
            cta: {
              field: "",
              constantValue: {
                label: "View Menu",
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
        },
      },
    ],
  },
  render: (props) => <HeroComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualHeroSection",
  displayName: "Hero Section",
  description: "Hero Section",
  pageSetTypes: ["ENTITY"],
};
