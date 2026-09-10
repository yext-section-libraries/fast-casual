import type { SectionConfig } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  getThemeColorCssValue,
  resolveTextColor,
} from "../shared/styleHelpers";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
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
  panelBackgroundColor: {
    label: "Panel Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
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
      startOfWeek: {
        label: "Start Of Week",
        type: "select",
        options: [
          { label: "Monday", value: "monday" },
          { label: "Tuesday", value: "tuesday" },
          { label: "Wednesday", value: "wednesday" },
          { label: "Thursday", value: "thursday" },
          { label: "Friday", value: "friday" },
          { label: "Saturday", value: "saturday" },
          { label: "Sunday", value: "sunday" },
          { label: "Today", value: "today" },
        ],
      },
      collapseDays: {
        label: "Collapse Days",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showAdditionalHoursText: {
        label: "Show Additional Hours Text",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      alignment: {
        label: "Alignment",
        type: "select",
        options: [
          { label: "Start", value: "items-start" },
          { label: "Center", value: "items-center" },
          { label: "End", value: "items-end" },
        ],
      },
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
      fontColor: {
        label: "Text Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
    },
  },
  image: {
    label: "Hours Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
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
    const interval = statusProps.isOpen
      ? statusProps.currentInterval
      : statusProps.futureInterval;
    const time = statusProps.isOpen
      ? interval?.getEndTime(locale, statusProps.timeOptions)
      : interval?.getStartTime(locale, statusProps.timeOptions);
    const futureText =
      time && statusProps.isOpen
        ? `Closes at ${time}`
        : time
          ? `Opens at ${time}`
          : "";
    const dayOfWeek =
      props.hoursStyles.showDayNames && interval
        ? statusProps.isOpen
          ? interval.end
              ?.setLocale(locale)
              .toLocaleString(statusProps.dayOptions)
          : interval.start
              ?.setLocale(locale)
              .toLocaleString(statusProps.dayOptions)
        : "";
    const currentStatusText = statusProps.isOpen ? "Open Now" : "Closed";

    return (
      <div
        className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: panelForeground }}
      >
        <span
          className="rounded-full px-3 py-1 text-[10px]"
          style={{
            backgroundColor: panelForeground,
            color: getThemeColorCssValue(props.panelBackgroundColor) ?? "#FFFFFF",
          }}
        >
          {currentStatusText}
        </span>
        {futureText ? (
          <span className="text-[11px] tracking-[0.02em]">
            {dayOfWeek ? `${futureText} ${dayOfWeek}` : futureText}
          </span>
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
            backgroundColor: getThemeColorCssValue(props.section.backgroundColor),
          }}
        >
          <style>{hoursTypographyStyles}</style>
          <div
            className="mx-auto grid max-w-[1440px] grid-rows-2 overflow-hidden md:rounded-[14px] lg:grid-cols-2 lg:grid-rows-1"
            style={{
              backgroundColor: getThemeColorCssValue(props.panelBackgroundColor),
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
                      <div style={hoursTextStyles}>
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          startOfWeek={props.hoursStyles.startOfWeek}
                          collapseDays={props.hoursStyles.collapseDays}
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
  label: "Hours Section",
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
