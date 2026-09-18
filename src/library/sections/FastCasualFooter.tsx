import type { SectionConfig } from "@yext/visual-editor";
import {
  createAspectRatioField,
  getScopedTypographyStyles,
  getTextStyle,
  getThemeColorCssValue,
} from "../shared/styleHelpers";

import * as React from "react";
import { useTranslation } from "react-i18next";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  getAnalyticsScopeHash,
  Image,
  StyledTextValue,
  ThemeColor,
  TranslatableAssetImage,
  TranslatableString,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  i18nPageInstance,
  msg,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  isDarkColor,
  Background,
} from "@yext/visual-editor";

type BasicLink = {
  cta: Omit<Partial<ComprehensiveCTAValue>, "sx">;
};

type FooterProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  logoImage: {
    image: YextEntityField<TranslatableAssetImage>;
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
  };
  brandName: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  copyright: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  quickLinks: BasicLink[];
  socialLinks: BasicLink[];
  legalLinks: BasicLink[];
  appStoreCta: Omit<Partial<ComprehensiveCTAValue>, "sx">;
  playStoreCta: Omit<Partial<ComprehensiveCTAValue>, "sx">;
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

const makeTextStyles = (): StyledTextValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
});

const defaultCtaButtonStyles = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  borderRadius: "default",
  letterSpacing: "default",
} satisfies NonNullable<ComprehensiveCTAValue["styles"]["button"]>;

const defaultCtaLinkStyles = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  letterSpacing: "default",
  includeCaret: "none",
} satisfies NonNullable<ComprehensiveCTAValue["styles"]["link"]>;

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
    buttonText: {
      defaultValue: "Button",
    },
    customId: "",
    customClass: "",
    dataAttributes: [],
    ariaLabel: {
      defaultValue: "Button",
    },
  },
  styles: {
    variant: "link",
    presetImage: "app-store",
    button: defaultCtaButtonStyles,
    link: defaultCtaLinkStyles,
  },
});

const makeBadgeCta = (
  link: string,
  presetImage: "app-store" | "google-play",
): Omit<Partial<ComprehensiveCTAValue>, "sx"> => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "",
        },
        link,
        openInNewTab: false,
        ctaType: "presetImage",
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
    buttonText: {
      defaultValue: "Button",
    },
    customId: "",
    customClass: "",
    dataAttributes: [],
    ariaLabel: {
      defaultValue: "Button",
    },
  },
  styles: {
    variant: "link",
    presetImage,
    button: defaultCtaButtonStyles,
    link: {
      ...defaultCtaLinkStyles,
      includeCaret: "default",
    },
  },
});

const FooterFields: YextFields<FooterProps> = {
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
  logoImage: {
    label: msg("fields.logoImage", "Logo Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
      aspectRatio: createAspectRatioField(
        msg("fields.options.aspectRatio", "Aspect Ratio"),
      ),
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select",
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
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
  copyright: {
    label: msg("fields.copyright", "Copyright"),
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
  quickLinks: {
    label: msg("fields.quickLinks", "Quick Links"),
    type: "array",
    arrayFields: {
      cta: {
        label: msg("fields.callToAction", "Call to Action"),
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: makeLinkCta("Link", "#"),
    },
    getItemSummary: (item) => getCtaSummary(item.cta, "Quick Link"),
  },
  socialLinks: {
    label: msg("fields.socialLinks", "Social Links"),
    type: "array",
    arrayFields: {
      cta: {
        label: msg("fields.callToAction", "Call to Action"),
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: makeLinkCta("Social", "#"),
    },
    getItemSummary: (item) => getCtaSummary(item.cta, "Social Link"),
  },
  legalLinks: {
    label: msg("fields.legalLinks", "Legal Links"),
    type: "array",
    arrayFields: {
      cta: {
        label: msg("fields.callToAction", "Call to Action"),
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: makeLinkCta("Legal", "#"),
    },
    getItemSummary: (item) => getCtaSummary(item.cta, "Legal Link"),
  },
  appStoreCta: {
    label: msg("fields.appStoreCta", "App Store CTA"),
    type: "comprehensiveCTA",
  },
  playStoreCta: {
    label: msg("fields.playStoreCta", "Play Store CTA"),
    type: "comprehensiveCTA",
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

const toRenderableCTA = (
  cta: Omit<Partial<ComprehensiveCTAValue>, "sx">,
  defaultColor: ThemeColor,
): Omit<Partial<ComprehensiveCTAValue>, "sx"> => ({
  data: cta.data,
  styles: {
    ...cta.styles,
    variant: cta.styles?.variant ?? "link",
    color: cta.styles?.color ?? defaultColor,
  },
  className: cta.className,
});

const footerTypographyScopeClass = "yfc-footer-typography";

const footerTypographyStyles = getScopedTypographyStyles(
  footerTypographyScopeClass,
);

const FooterComponent: PuckComponent<FooterProps> = (props) => {
  const { t } = useTranslation();
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextFastCasualFooter${getAnalyticsScopeHash(props.id)}`;
  const rawLogo = resolveComponentData(
    props.logoImage.image,
    locale,
    streamDocument,
  );
  const resolvedLogo = isResolvedImage(rawLogo) ? rawLogo : undefined;
  const sectionForeground = isDarkColor(props.section.backgroundColor)
    ? "#FFFFFF"
    : "#000000";
  const defaultCTAColor = getDefaultCTAColor(
    isDarkColor(props.section.backgroundColor),
  );
  const brandName =
    resolveComponentData(props.brandName.text, locale, streamDocument) || "";
  const copyright =
    resolveComponentData(props.copyright.text, locale, streamDocument) || "";
  const logoAspectRatio =
    props.logoImage.aspectRatio > 0 ? props.logoImage.aspectRatio : undefined;
  const logoObjectFit =
    props.logoImage.imageConstrain === "filled" ? "cover" : "contain";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <Background
          background={props.section.backgroundColor}
          as="footer"
          className={`${footerTypographyScopeClass} px-6 py-6 md:px-8`}
        >
          <style>{footerTypographyStyles}</style>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr_0.7fr]">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  {resolvedLogo ? (
                    <EntityField
                      displayName="Logo Image"
                      fieldId={props.logoImage.image.field}
                      constantValueEnabled={
                        props.logoImage.image.constantValueEnabled
                      }
                    >
                      <div
                        className="h-11 max-w-full overflow-hidden rounded-[12px]"
                        style={{
                          width: logoAspectRatio ? `${44 * logoAspectRatio}px` : undefined,
                          aspectRatio: logoAspectRatio,
                        }}
                      >
                        <Image
                          image={resolvedLogo}
                          className="h-full w-full"
                          style={{
                            objectFit: logoObjectFit,
                            objectPosition: "center",
                          }}
                        />
                      </div>
                    </EntityField>
                  ) : null}
                  <EntityField
                    displayName="Brand Name"
                    fieldId={props.brandName.text.field}
                    constantValueEnabled={
                      props.brandName.text.constantValueEnabled
                    }
                  >
                  <p
                    className="text-[24px] font-bold"
                    style={{
                      ...getTextStyle(props.brandName.styles),
                      color: getThemeColorCssValue(props.brandName.fontColor) ?? sectionForeground,
                    }}
                  >
                      {brandName}
                    </p>
                  </EntityField>
                </div>
                <EntityField
                  displayName="Copyright"
                  fieldId={props.copyright.text.field}
                  constantValueEnabled={
                    props.copyright.text.constantValueEnabled
                  }
                >
                  <p
                    className="text-[12px] text-white/70"
                    style={{
                      ...getTextStyle(props.copyright.styles),
                      color:
                        getThemeColorCssValue(props.copyright.fontColor) ??
                        sectionForeground,
                    }}
                  >
                    {copyright}
                  </p>
                </EntityField>
              </div>
              <div>
                <p
                  className="mb-4 text-[14px] font-semibold"
                  style={{ color: sectionForeground }}
                >
                  {t("quickLinks", "Quick Links")}
                </p>
                <div className="grid gap-3 text-[13px] md:grid-cols-3">
                  {[0, 1, 2].map((column) => (
                    <div key={column} className="flex flex-col gap-2">
                      {(props.quickLinks ?? [])
                        .map((link, index) => ({ link, index }))
                        .filter(({ index }) => index % 3 === column)
                        .map(({ link, index }) => (
                          <EntityField
                            key={`${
                              link.cta.data?.cta?.constantValue?.label ?? "link"
                            }-${column}-${index}`}
                            displayName={`Quick Link ${index + 1}`}
                            fieldId={link.cta.data?.cta.field}
                            constantValueEnabled={
                              link.cta.data?.cta.constantValueEnabled
                            }
                          >
                            <ComprehensiveCTA
                              value={toRenderableCTA(link.cta, defaultCTAColor)}
                              eventName={`footerLink${index}`}
                            />
                          </EntityField>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="mb-4 text-[14px] font-semibold"
                  style={{ color: sectionForeground }}
                >
                  {t("socialMedia", "Social Media")}
                </p>
                <div className="grid gap-2 text-[13px]">
                  {(props.socialLinks ?? []).map((link, index) => (
                    <EntityField
                      key={`${
                        link.cta.data?.cta?.constantValue?.label ?? "social"
                      }-${index}`}
                      displayName={`Social Link ${index + 1}`}
                      fieldId={link.cta.data?.cta.field}
                      constantValueEnabled={
                        link.cta.data?.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={toRenderableCTA(link.cta, defaultCTAColor)}
                        eventName={`footerSocial${index}`}
                      />
                    </EntityField>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <EntityField
                  displayName="App Store CTA"
                  fieldId={props.appStoreCta.data?.cta.field}
                  constantValueEnabled={
                    props.appStoreCta.data?.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={toRenderableCTA(props.appStoreCta, defaultCTAColor)}
                    eventName="footerBadge0"
                  />
                </EntityField>
                <EntityField
                  displayName="Play Store CTA"
                  fieldId={props.playStoreCta.data?.cta.field}
                  constantValueEnabled={
                    props.playStoreCta.data?.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={toRenderableCTA(props.playStoreCta, defaultCTAColor)}
                    eventName="footerBadge1"
                  />
                </EntityField>
              </div>
              <nav className="flex flex-wrap gap-4 text-[12px] text-white/80">
                {(props.legalLinks ?? []).map((link, index) => (
                  <EntityField
                    key={`${
                      link.cta.data?.cta?.constantValue?.label ?? "legal"
                    }-${index}`}
                    displayName={`Legal Link ${index + 1}`}
                    fieldId={link.cta.data?.cta.field}
                    constantValueEnabled={
                      link.cta.data?.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={toRenderableCTA(link.cta, defaultCTAColor)}
                      eventName={`footerLegal${index}`}
                    />
                  </EntityField>
                ))}
              </nav>
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualFooter: YextComponentConfig<FooterProps> = {
  label: msg("components.footer", "Footer"),
  fields: FooterFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      visibleOnLivePage: true,
    },
    logoImage: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/OLT2KExDEKhKlCmIobyRRHN6MFUS77fVs5gIt_FTnBI/450x450.jpg",
          width: 450,
          height: 450,
        },
        constantValueEnabled: true,
      },
      aspectRatio: 1,
      imageConstrain: "filled",
    },
    brandName: {
      text: {
        field: "name",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
    copyright: {
      text: {
        field: "",
        constantValue: { defaultValue: "© 2026 [[name]]" },
        constantValueEnabled: true,
      },
      styles: makeTextStyles(),
      fontColor: undefined,
    },
    quickLinks: [
      { cta: makeLinkCta("Menu", "#") },
      { cta: makeLinkCta("Order Online", "#") },
      { cta: makeLinkCta("Reservations", "#") },
      { cta: makeLinkCta("Group Events", "#") },
      { cta: makeLinkCta("Catering", "#") },
      { cta: makeLinkCta("Careers", "#") },
      { cta: makeLinkCta("Gift Cards", "#") },
      { cta: makeLinkCta("Contact", "#") },
    ],
    socialLinks: [
      { cta: makeLinkCta("Facebook", "#") },
      { cta: makeLinkCta("Instagram", "#") },
      { cta: makeLinkCta("Yelp", "#") },
    ],
    legalLinks: [
      { cta: makeLinkCta("Privacy", "#") },
      { cta: makeLinkCta("Terms", "#") },
      { cta: makeLinkCta("Accessibility", "#") },
    ],
    appStoreCta: makeBadgeCta("#", "app-store"),
    playStoreCta: makeBadgeCta("#", "google-play"),
  },
  render: (props) => <FooterComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
