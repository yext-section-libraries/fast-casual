import type { SectionConfig } from "@yext/visual-editor";
import { msg } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  getThemeColorCssValue,
  resolveTextColor,
} from "../shared/styleHelpers";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
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
  i18nPageInstance,
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
    i18nPageInstance.language,
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
  heroImage: {
    label: msg("fields.heroImage", "Hero Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
    },
  },
  brandName: {
    label: msg("fields.brandName", "Brand Name"),
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
  geomodifier: {
    label: msg("fields.geomodifier", "Geomodifier"),
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
  hours: {
    type: "entityField",
    label: msg("fields.hours", "Hours"),
    filter: { types: ["type.hours"] },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: msg("fields.hoursStyles", "Hours Styles"),
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: msg("fields.showCurrentStatus", "Show Current Status"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      timeFormat: {
        label: msg("fields.timeFormat", "Time Format"),
        type: "select",
        options: [
          { label: msg("fields.options.hour12Label", "12 Hour"), value: "12h" },
          { label: msg("fields.options.hour24Label", "24 Hour"), value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: msg("fields.dayOfWeekFormatLabel", "Day Of Week Format"),
        type: "select",
        options: [
          { label: msg("fields.options.short", "Short"), value: "short" },
          { label: msg("fields.options.long", "Long"), value: "long" },
        ],
      },
      showDayNames: {
        label: msg("fields.showDayNames", "Show Day Names"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  actions: {
    label: msg("fields.actions", "Actions"),
    type: "array",
    arrayFields: {
      cta: {
        label: msg("fields.callToAction", "Call to Action"),
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

const heroTypographyStyles = getScopedTypographyStyles(
  heroTypographyScopeClass,
);

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
  const { t, i18n } = useTranslation();
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
  const panelBackground = getThemeColorCssValue(props.section.backgroundColor);

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
    const isComingSoon = !!statusProps.comingSoon;
    const isOpen24Hours = !!statusProps.currentInterval?.is24h?.();
    const isIndefinitelyClosed = !statusProps.futureInterval;
    const hasFutureStatus = !isOpen24Hours && !isIndefinitelyClosed;
    const interval = statusProps.isOpen
      ? statusProps.currentInterval
      : statusProps.futureInterval;
    const time = statusProps.isOpen
      ? (interval?.getEndTime(i18n.language, statusProps.timeOptions) ?? "")
      : (interval?.getStartTime(i18n.language, statusProps.timeOptions) ?? "");
    const showDay =
      props.hoursStyles.showDayNames && hasFutureStatus && interval;
    const dayText =
      showDay && interval
        ? statusProps.isOpen
          ? interval.end
              ?.setLocale(i18n.language)
              .toLocaleString(statusProps.dayOptions)
          : interval.start
              ?.setLocale(i18n.language)
              .toLocaleString(statusProps.dayOptions)
        : "";
    const currentStatusText = isComingSoon
      ? t("comingSoon", "Coming Soon")
      : isOpen24Hours
        ? t("open24Hours", "Open 24 Hours")
        : isIndefinitelyClosed
          ? t("temporarilyClosed", "Temporarily Closed")
          : statusProps.isOpen
            ? t("openNow", "Open Now")
            : t("closed", "Closed");
    const futureText =
      !isComingSoon && hasFutureStatus && time
        ? statusProps.isOpen
          ? dayText
            ? t(
                "closesAtTimeWeek",
                "Closes at {{time}} {{dayOfWeek}}",
                { time, dayOfWeek: dayText },
              )
            : t("closesAtTime", "Closes at {{time}}", { time })
          : dayText
            ? t(
                "opensAtTimeWeek",
                "Opens at {{time}} {{dayOfWeek}}",
                { time, dayOfWeek: dayText },
              )
            : t("opensAtTime", "Opens at {{time}}", { time })
        : "";

    return (
      <div
        className="flex w-full flex-wrap items-center justify-center gap-2 text-center text-[12px] font-medium uppercase tracking-[0.08em]"
        style={{ color: heroTextColor }}
      >
        {(props.hoursStyles.showCurrentStatus || isComingSoon) && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{
              backgroundColor:
                getThemeColorCssValue(defaultCTAColor) ??
                (panelIsDark ? "#FFFFFF" : "#000000"),
              color:
                getThemeColorCssValue(defaultCTAColor.contrastingColor) ??
                (panelIsDark ? "#000000" : "#FFFFFF"),
            }}
          >
            {currentStatusText}
          </span>
        )}
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
                    ...getTextStyle(props.brandName.styles),
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
                    ...getTextStyle(props.geomodifier.styles),
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
                    <span>
                      {t("ratingInStars", {
                        defaultValue: "{{rating}} Stars",
                        rating: ratingValue.toFixed(1),
                      })}
                    </span>
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
                    <span>
                      {t("reviewsWithCount", {
                        count: ratingCount,
                        defaultValue_one: "{{count}} Review",
                        defaultValue_other: "{{count}} Reviews",
                      })}
                    </span>
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
                    {props.hoursStyles.showCurrentStatus ||
                    streamDocument.comingSoon ? (
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
  label: msg("components.heroSection", "Hero Section"),
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
