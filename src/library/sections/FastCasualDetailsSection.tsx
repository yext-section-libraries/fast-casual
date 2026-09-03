import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import type { PuckComponent } from "@puckeditor/core";
import {
  Address,
  Link,
  AnalyticsScopeProvider,
  type AddressType,
} from "@yext/pages-components";
import {
  ComprehensiveCTA,
  EntityField,
  type ComprehensiveCTAValue,
  Image,
  MaybeRTF,
  StyledTextValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableRichText,
  TranslatableString,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  i18nComponentsInstance,
  getAnalyticsScopeHash,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  isDarkColor,
} from "@yext/visual-editor";

type BasicLink = {
  cta: Omit<Partial<ComprehensiveCTAValue>, "sx">;
};

type LinkLikeCta = {
  data?: {
    cta?: {
      constantValue?: {
        label?: unknown;
      };
    };
  };
};

type DetailsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  panelBackgroundColor: ThemeColor;
  image: {
    image: YextEntityField<TranslatableAssetImage>;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  phones: {
    items: {
      number: YextEntityField<string>;
      label: string;
    }[];
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  utilityLinks: BasicLink[];
  details: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
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

const getEntityFieldSummary = (
  field: Pick<YextEntityField<unknown>, "constantValue" | "field"> | undefined,
  fallback: string,
): string => {
  const constantValueSummary = getEditableSummary(field?.constantValue, "");
  return constantValueSummary || field?.field || fallback;
};

const getCtaSummary = (
  cta: LinkLikeCta | undefined,
  fallback: string,
): string => getEditableSummary(cta?.data?.cta?.constantValue?.label, fallback);

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

const textStylesToCss = (styles: StyledTextValue) => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const makeTextStyles = (): StyledTextValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
});

const makeLinkCta = (
  label: string,
  link: string,
): Omit<Partial<ComprehensiveCTAValue>, "sx"> => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label,
        link,
        openInNewTab: false,
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
  },
  styles: {
    variant: "link",
  },
});

const getCtaLabel = (cta: LinkLikeCta) =>
  getEditableSummary(cta.data?.cta?.constantValue?.label, "");

const formatPhone = (
  value: string,
  format: "international" | "domestic",
  regionCode: string,
) => {
  const parsed = parsePhoneNumber(value.replace(/(?!^\+)\+|[^\d+]/g, ""), {
    regionCode,
  });
  if (!parsed.valid || !parsed.number) {
    return value;
  }
  return format === "international"
    ? parsed.number.international
    : parsed.number.national;
};

const DetailsFields: YextFields<DetailsProps> = {
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
  image: {
    label: "Details Image",
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
  address: {
    type: "entityField",
    label: "Address",
    filter: { types: ["type.address"] },
  },
  showRegion: {
    label: "Show Region",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  showCountry: {
    label: "Show Country",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  phones: {
    label: "Phones",
    type: "object",
    objectFields: {
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          number: {
            type: "entityField",
            label: "Number",
            filter: { types: ["type.phone"] },
          },
          label: {
            label: "Label",
            type: "text",
          },
        },
        defaultItemProps: {
          number: {
            field: "",
            constantValue: "",
            constantValueEnabled: true,
          } as YextEntityField<string>,
          label: "",
        },
        getItemSummary: (item) =>
          item.label || getEntityFieldSummary(item.number, "Phone"),
      },
      phoneFormat: {
        label: "Phone Format",
        type: "radio",
        options: [
          { label: "Domestic", value: "domestic" },
          { label: "International", value: "international" },
        ],
      },
      includeHyperlink: {
        label: "Include Hyperlink",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  utilityLinks: {
    label: "Utility Links",
    type: "array",
    arrayFields: {
      cta: {
        label: "Call to Action",
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: makeLinkCta("Website", "#"),
    },
    getItemSummary: (item) => getCtaSummary(item.cta, "Utility Link"),
  },
  details: {
    label: "Details",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.rich_text_v2"],
        },
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

const detailsTypographyScopeClass = "yfc-details-typography";

const detailsTypographyStyles = `
  .${detailsTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${detailsTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${detailsTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${detailsTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${detailsTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${detailsTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${detailsTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${detailsTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${detailsTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${detailsTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const DetailsComponent: PuckComponent<DetailsProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const panelForeground = isDarkColor(props.panelBackgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const resolvedImage = resolveComponentData(
    props.image.image,
    locale,
    streamDocument,
  );
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
  const resolvedAddress = resolveComponentData(
    props.address,
    locale,
    streamDocument,
  );
  const phoneRegionCode =
    typeof resolvedAddress?.countryCode === "string" &&
    resolvedAddress.countryCode.trim()
      ? resolvedAddress.countryCode.trim()
      : "US";
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const details =
    resolveComponentData(props.details.text, locale, streamDocument, {
      richTextStyleOverrides: {
        ...textStylesToCss(props.details.styles),
        color: resolveTextColor(props.details.fontColor, panelForeground),
      },
    }) || "";
  const resolvedPhones = (props.phones.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const raw =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const label = item.label.trim();
      if (!raw) {
        return null;
      }
      return {
        label,
        formatted: formatPhone(raw, props.phones.phoneFormat, phoneRegionCode),
        raw,
        fieldId: item.number.field,
        constantValueEnabled: item.number.constantValueEnabled,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const scopeName = `YextFastCasualDetailsSection${getAnalyticsScopeHash(props.id)}`;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${detailsTypographyScopeClass} bg-white px-0 py-0 md:px-8 md:py-5`}
          style={{
            backgroundColor: themeColorToCss(props.section.backgroundColor),
          }}
        >
          <style>{detailsTypographyStyles}</style>
          <div
            className="mx-auto grid max-w-[1440px] grid-rows-2 overflow-hidden md:rounded-[14px] lg:grid-cols-2 lg:grid-rows-1"
            style={{
              backgroundColor: themeColorToCss(props.panelBackgroundColor),
            }}
          >
            <div
              className="relative order-2 overflow-hidden lg:order-1"
              style={{ height: contentHeight }}
            >
              {resolvedImage ? (
                <EntityField
                  displayName="Details Image"
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
            <div
              ref={contentRef}
              className="order-1 flex min-w-0 flex-col justify-center gap-5 px-6 py-7 md:px-8 md:py-8 lg:order-2"
              style={{ color: panelForeground }}
            >
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="text-[30px] font-bold leading-none md:text-[36px]"
                  style={{
                    ...textStylesToCss(props.heading.styles),
                    color: resolveTextColor(
                      props.heading.fontColor,
                      panelForeground,
                    ),
                  }}
                >
                  {headingText}
                </h2>
              </EntityField>
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em]">
                    Address
                  </p>
                  {resolvedAddress ? (
                    <EntityField
                      displayName="Address"
                      fieldId={props.address.field}
                      constantValueEnabled={props.address.constantValueEnabled}
                    >
                      <Address
                        address={resolvedAddress}
                        showRegion={props.showRegion}
                        showCountry={props.showCountry}
                      />
                    </EntityField>
                  ) : null}
                </div>
                <div className="grid gap-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em]">
                    Phone
                  </p>
                  {resolvedPhones.map((phone, index) => (
                    <EntityField
                      key={`${phone.raw}-${index}`}
                      displayName="Phone Number"
                      fieldId={phone.fieldId}
                      constantValueEnabled={phone.constantValueEnabled}
                    >
                      <div className="text-[14px]">
                        {props.phones.includeHyperlink ? (
                          <Link
                            cta={{
                              link: phone.raw.replace(/\D/g, ""),
                              linkType: "PHONE",
                            }}
                            className="text-current no-underline"
                          >
                            {phone.label
                              ? `${phone.label} ${phone.formatted}`
                              : phone.formatted}
                          </Link>
                        ) : (
                          <p>
                            {phone.label
                              ? `${phone.label} ${phone.formatted}`
                              : phone.formatted}
                          </p>
                        )}
                      </div>
                    </EntityField>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-[13px] font-medium underline underline-offset-4">
                  {(props.utilityLinks ?? []).map((item, index) => {
                    const ctaLabel =
                      getCtaLabel(item.cta) || `Utility Link ${index + 1}`;

                    return (
                      <EntityField
                        key={`${ctaLabel}-${index}`}
                        displayName={`Utility Link ${index + 1}`}
                        fieldId={item.cta.data?.cta.field}
                        constantValueEnabled={
                          item.cta.data?.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          value={item.cta}
                          eventName={`utilityLink${index + 1}`}
                          className="text-current no-underline"
                        />
                      </EntityField>
                    );
                  })}
                </div>
                <div className="grid gap-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em]">
                    Other Details
                  </p>
                  <EntityField
                    displayName="Details"
                    fieldId={props.details.text.field}
                    constantValueEnabled={
                      props.details.text.constantValueEnabled
                    }
                  >
                    {React.isValidElement(details) ? (
                      details
                    ) : (
                      <MaybeRTF
                        data={details as string | undefined}
                        richTextStyleOverrides={{
                          ...textStylesToCss(props.details.styles),
                          color: resolveTextColor(
                            props.details.fontColor,
                            panelForeground,
                          ),
                        }}
                      />
                    )}
                  </EntityField>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualDetailsSection: YextComponentConfig<DetailsProps> = {
  label: "Details Section",
  fields: DetailsFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      visibleOnLivePage: true,
    },
    panelBackgroundColor: {
      selectedColor: "palette-secondary",
      contrastingColor: "palette-secondary-contrast",
    },
    image: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
    },
    heading: {
      text: {
        field: "",
        constantValue: { defaultValue: "Restaurant Details" },
        constantValueEnabled: true,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
    address: {
      field: "address",
      constantValue: {
        line1: "",
        city: "",
        postalCode: "",
        countryCode: "",
        region: "",
      },
      constantValueEnabled: false,
    } satisfies YextEntityField<AddressType>,
    showRegion: true,
    showCountry: false,
    phones: {
      items: [
        {
          number: {
            field: "mainPhone",
            constantValue: "",
            constantValueEnabled: false,
          } satisfies YextEntityField<string>,
          label: "",
        },
      ],
      phoneFormat: "domestic",
      includeHyperlink: true,
    },
    utilityLinks: [
      { cta: makeLinkCta("Website", "#") },
      { cta: makeLinkCta("Get Directions", "#") },
    ],
    details: {
      text: {
        field: "",
        constantValue: {
          defaultValue: {
            html: "<p>Price range: $$</p><p>Cuisine: Burgers, American</p><p>Meals served: Lunch, Dinner, Brunch</p>",
            json: "{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Price range: $$\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cuisine: Burgers, American\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Meals served: Lunch, Dinner, Brunch\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}",
          },
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
  },
  render: (props) => <DetailsComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualDetailsSection",
  displayName: "Details Section",
  description: "Details Section",
  pageSetTypes: ["ENTITY"],
};
