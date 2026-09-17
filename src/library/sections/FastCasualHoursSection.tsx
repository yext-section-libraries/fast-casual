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
  HoursStatus,
  HoursTable,
  type DayOfWeekNames,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import {
  EntityField,
  Image,
  StyledTextValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableString,
  useDocument,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  getAnalyticsScopeHash,
  resolveComponentData,
  isDarkColor,
} from "@yext/visual-editor";

type HoursStyles = {
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
  fontColor?: ThemeColor;
  styles: StyledTextValue;
};

type HoursProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  panelBackgroundColor: ThemeColor;
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStyles;
  image: {
    image: YextEntityField<TranslatableAssetImage>;
  };
};

const HoursFields: YextFields<HoursProps> = {
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
  panelBackgroundColor: {
    label: msg("fields.panelBackgroundColor", "Panel Background Color"),
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
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
      startOfWeek: {
        label: msg("fields.startOfWeek", "Start Of Week"),
        type: "select",
        options: [
          { label: msg("fields.options.monday", "Monday"), value: "monday" },
          { label: msg("fields.options.tuesday", "Tuesday"), value: "tuesday" },
          {
            label: msg("fields.options.wednesday", "Wednesday"),
            value: "wednesday",
          },
          {
            label: msg("fields.options.thursday", "Thursday"),
            value: "thursday",
          },
          { label: msg("fields.options.friday", "Friday"), value: "friday" },
          {
            label: msg("fields.options.saturday", "Saturday"),
            value: "saturday",
          },
          { label: msg("fields.options.sunday", "Sunday"), value: "sunday" },
          { label: msg("fields.options.today", "Today"), value: "today" },
        ],
      },
      collapseDays: {
        label: msg("fields.collapseDays", "Collapse Days"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      showAdditionalHoursText: {
        label: msg(
          "fields.showAdditionalHoursText",
          "Show Additional Hours Text",
        ),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      alignment: {
        label: msg("fields.alignment", "Alignment"),
        type: "select",
        options: [
          { label: msg("fields.options.start", "Start"), value: "items-start" },
          {
            label: msg("fields.options.center", "Center"),
            value: "items-center",
          },
          { label: msg("fields.options.end", "End"), value: "items-end" },
        ],
      },
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
      fontColor: {
        label: msg("fields.textColor", "Text Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
    },
  },
  image: {
    label: msg("fields.hoursImage", "Hours Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
    },
  },
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

const hoursTypographyScopeClass = "yfc-hours-typography";

const hoursTypographyStyles = getScopedTypographyStyles(
  hoursTypographyScopeClass,
);

const HoursComponent: PuckComponent<HoursProps> = (props) => {
  const { t, i18n } = useTranslation();
  const dayOfWeekNames = React.useMemo<DayOfWeekNames>(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      timeZone: "UTC",
      weekday: "long",
    });
    const formatWeekday = (day: number) =>
      formatter.format(new Date(Date.UTC(2024, 0, day)));

    return {
      sunday: formatWeekday(7),
      monday: formatWeekday(8),
      tuesday: formatWeekday(9),
      wednesday: formatWeekday(10),
      thursday: formatWeekday(11),
      friday: formatWeekday(12),
      saturday: formatWeekday(13),
    };
  }, [i18n.language]);
  const streamDocument = useDocument<any>();
  const locale = streamDocument.locale ?? "en";
  const rawHours = resolveComponentData(props.hours, locale, streamDocument);
  const resolvedHours = isResolvedHours(rawHours) ? rawHours : undefined;
  const rawImage = resolveComponentData(
    props.image.image,
    locale,
    streamDocument,
  );
  const resolvedImage = isResolvedImage(rawImage) ? rawImage : undefined;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState<number>();
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    const updateContentHeight = () => {
      setContentHeight(content.getBoundingClientRect().height);
    };
    updateContentHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateContentHeight);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, []);
  const scopeName = `YextFastCasualHoursSection${getAnalyticsScopeHash(props.id)}`;
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const panelForeground = isDarkColor(props.panelBackgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const hoursTextStyles = {
    ...getTextStyle(props.hoursStyles.styles),
    color: resolveTextColor(props.hoursStyles.fontColor, panelForeground),
  };
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
    const dayOfWeek =
      props.hoursStyles.showDayNames && hasFutureStatus && interval
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
          ? dayOfWeek
            ? t(
                "closesAtTimeWeek",
                "Closes at {{time}} {{dayOfWeek}}",
                { time, dayOfWeek },
              )
            : t("closesAtTime", "Closes at {{time}}", { time })
          : dayOfWeek
            ? t(
                "opensAtTimeWeek",
                "Opens at {{time}} {{dayOfWeek}}",
                { time, dayOfWeek },
              )
            : t("opensAtTime", "Opens at {{time}}", { time })
        : "";

    return (
      <div
        className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: panelForeground }}
      >
        {(props.hoursStyles.showCurrentStatus || isComingSoon) && (
          <span
            className="rounded-full px-3 py-1 text-[10px]"
            style={{
              backgroundColor: panelForeground,
              color:
                getThemeColorCssValue(props.panelBackgroundColor) ?? "#FFFFFF",
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
          className={`${hoursTypographyScopeClass} bg-white px-0 py-0 md:px-8 md:py-5`}
          style={{
            backgroundColor: getThemeColorCssValue(
              props.section.backgroundColor,
            ),
          }}
        >
          <style>{hoursTypographyStyles}</style>
          <div
            className="mx-auto grid max-w-[1440px] grid-rows-2 overflow-hidden md:rounded-[14px] lg:grid-cols-2 lg:grid-rows-1"
            style={{
              backgroundColor: getThemeColorCssValue(
                props.panelBackgroundColor,
              ),
            }}
          >
            <div
              ref={contentRef}
              className="flex min-w-0 flex-col justify-center px-6 py-7 md:px-8 md:py-8"
              style={{ color: panelForeground }}
            >
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="mb-4 text-[30px] font-bold leading-none md:text-[36px]"
                  style={{
                    ...getTextStyle(props.heading.styles),
                    color: resolveTextColor(
                      props.heading.fontColor,
                      panelForeground,
                    ),
                  }}
                >
                  {headingText}
                </h2>
              </EntityField>
              {resolvedHours ? (
                <div className={`flex flex-col ${props.hoursStyles.alignment}`}>
                  <EntityField
                    displayName="Hours"
                    fieldId={props.hours.field}
                    constantValueEnabled={props.hours.constantValueEnabled}
                  >
                    <div style={{ color: panelForeground }}>
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
                      <div style={hoursTextStyles}>
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          dayOfWeekNames={dayOfWeekNames}
                          startOfWeek={props.hoursStyles.startOfWeek}
                          collapseDays={props.hoursStyles.collapseDays}
                          intervalTranslations={{
                            isClosed: t("closed", "Closed"),
                            open24Hours: t("open24Hours", "Open 24 Hours"),
                            reopenDate: t("reopenDate", "Reopen Date"),
                            timeFormatLocale: i18n.language,
                          }}
                        />
                      </div>
                    </div>
                  </EntityField>
                  {props.hoursStyles.showAdditionalHoursText &&
                  additionalHoursText ? (
                    <EntityField
                      displayName="Additional Hours Text"
                      fieldId="additionalHoursText"
                      constantValueEnabled={false}
                    >
                      <span
                        className="mt-4 text-[13px] leading-6"
                        style={hoursTextStyles}
                      >
                        {additionalHoursText}
                      </span>
                    </EntityField>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div
              className="relative overflow-hidden"
              style={{ height: contentHeight }}
            >
              {resolvedImage ? (
                <EntityField
                  displayName="Hours Image"
                  fieldId={props.image.image.field}
                  constantValueEnabled={props.image.image.constantValueEnabled}
                >
                  <div className="absolute inset-0">
                    <Image
                      image={resolvedImage}
                      className="h-full w-full"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </EntityField>
              ) : null}
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualHoursSection: YextComponentConfig<HoursProps> = {
  label: msg("components.hoursSection", "Hours Section"),
  fields: HoursFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      visibleOnLivePage: true,
    },
    panelBackgroundColor: {
      selectedColor: "palette-tertiary",
      contrastingColor: "palette-tertiary-contrast",
    },
    heading: {
      text: {
        field: "",
        constantValue: { defaultValue: "Dining Hours" },
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
    hours: {
      field: "hours",
      constantValue: {},
      constantValueEnabled: false,
    },
    hoursStyles: {
      startOfWeek: "monday",
      collapseDays: false,
      showAdditionalHoursText: false,
      alignment: "items-start",
      showCurrentStatus: true,
      timeFormat: "12h",
      dayOfWeekFormat: "long",
      showDayNames: false,
      fontColor: undefined,
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
    },
    image: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
    },
  },
  render: (props) => <HoursComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualHoursSection",
  displayName: "Hours Section",
  description: "Hours Section",
  pageSetTypes: ["ENTITY"],
};
