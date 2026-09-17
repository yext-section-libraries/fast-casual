import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  getLinkStyle,
  getThemeColorCssValue,
  resolveTextColor,
} from "../shared/styleHelpers";

import * as React from "react";
import { useTranslation } from "react-i18next";
import type { PuckComponent } from "@puckeditor/core";
import {
  AnalyticsScopeProvider,
  Address,
  Link,
  type AddressType,
} from "@yext/pages-components";
import {
  EntityField,
  MapboxStaticMapComponent,
  type StreamDocument,
  type StyledLinkValue,
  StyledTextValue,
  ThemeColor,
  TranslatableString,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  getAnalyticsScopeHash,
  mapboxStaticMapStyleOptions,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
} from "@yext/visual-editor";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type NearbyLocationsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  nearbyLocationName: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  nearbyAddress: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  nearbyPhone: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  nearbyDistance: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  getDirectionsLink: {
    styles: StyledLinkValue;
    fontColor?: ThemeColor;
  };
  radius: number;
  limit: number;
  map: {
    apiKey: string;
    coordinate: YextEntityField<Coordinate>;
    mapStyle: string;
    zoom: number;
    height?: string;
  };
};

const NearbyFields: YextFields<NearbyLocationsProps> = {
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
  nearbyLocationName: {
    label: msg("fields.nearbyLocationName", "Nearby Location Name"),
    type: "object",
    objectFields: {
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
  nearbyAddress: {
    label: msg("fields.nearbyAddress", "Nearby Address"),
    type: "object",
    objectFields: {
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
  nearbyPhone: {
    label: msg("fields.nearbyPhone", "Nearby Phone"),
    type: "object",
    objectFields: {
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
  nearbyDistance: {
    label: msg("fields.nearbyDistance", "Nearby Distance"),
    type: "object",
    objectFields: {
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
  getDirectionsLink: {
    label: msg("fields.getDirectionsLink", "Get Directions Link"),
    type: "object",
    objectFields: {
      fontColor: {
        label: msg("fields.textColor", "Text Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      styles: {
        label: msg("fields.linkStyles", "Link Styles"),
        type: "styledLink",
      },
    },
  },
  radius: {
    label: msg("fields.radius", "Radius"),
    type: "number",
  },
  limit: {
    label: msg("fields.limit", "Limit"),
    type: "number",
  },
  map: {
    label: msg("fields.map", "Map"),
    type: "object",
    objectFields: {
      apiKey: {
        type: "text",
        label: msg("fields.mapboxApiKey", "Mapbox API Key"),
      },
      coordinate: {
        type: "entityField",
        label: msg("fields.coordinates", "Coordinates"),
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: msg("fields.mapboxMapStyle", "Mapbox Map Style"),
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: {
        label: msg("fields.zoom", "Zoom"),
        type: "number",
        min: 0,
        max: 22,
      },
    },
  },
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultLinkStyles: StyledLinkValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  letterSpacing: "default",
  includeCaret: "none",
};

const nearbyTypographyScopeClass = "yfc-nearby-typography";

const nearbyTypographyStyles = getScopedTypographyStyles(
  nearbyTypographyScopeClass,
  `
    .${nearbyTypographyScopeClass} a.yfc-nearby-directions {
      text-decoration: underline;
    }
    .${nearbyTypographyScopeClass} a.yfc-nearby-directions:hover {
      text-decoration: none;
    }
  `,
);

const toMiles = (from?: Coordinate, to?: Coordinate) => {
  if (!from || !to) {
    return null;
  }
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMi = 3958.8;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (earthRadiusMi * c).toFixed(1);
};

const isCoordinate = (value: unknown): value is Coordinate => {
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    "latitude" in value &&
    "longitude" in value
  );
};

const NearbyComponent: PuckComponent<NearbyLocationsProps> = (props) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<StreamDocument>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const rawCoordinate = resolveComponentData(
    props.map.coordinate,
    locale,
    streamDocument,
  );
  const coordinate = isCoordinate(rawCoordinate) ? rawCoordinate : undefined;
  const enabled =
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    Boolean(props.radius) &&
    Boolean(props.limit);
  const { data, status } = useNearbyLocations({
    streamDocument,
    latitude: coordinate?.latitude,
    longitude: coordinate?.longitude,
    radiusMi: props.radius,
    limit: props.limit,
    enabled,
  });
  const nearbyLocationDocs = data?.response?.docs ?? [];
  const scopeName = `YextFastCasualNearbyLocationsSection${getAnalyticsScopeHash(props.id)}`;
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const sectionBackground = getThemeColorCssValue(props.section.backgroundColor);
  const sectionForeground =
    getThemeColorCssValue(props.section.backgroundColor.contrastingColor) ??
    "#000000";

  if (!enabled) {
    return <></>;
  }

  if (status === "pending") {
    return (
      <section
        className={`${nearbyTypographyScopeClass} px-6 py-8 md:px-8`}
        style={{
          backgroundColor: sectionBackground,
          color: sectionForeground,
        }}
      >
        <style>{nearbyTypographyStyles}</style>
        <div className="mx-auto max-w-[1440px]">
          <EntityField
            displayName="Heading"
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2 className="mb-4 text-left text-[34px] font-bold leading-none md:text-[44px] lg:text-center">
              {headingText}
            </h2>
          </EntityField>
          <p className="text-center text-sm text-neutral-500">
            {t("loadingNearbyLocations", "Loading nearby locations")}
          </p>
        </div>
      </section>
    );
  }

  if (status !== "success" || !nearbyLocationDocs.length) {
    if (!props.puck.isEditing) {
      return <></>;
    }

    return (
      <section
        className={`${nearbyTypographyScopeClass} px-6 py-8 md:px-8`}
        style={{
          backgroundColor: sectionBackground,
          color: sectionForeground,
        }}
      >
        <style>{nearbyTypographyStyles}</style>
        <div className="mx-auto max-w-[1440px] text-center text-sm">
          {pt(
            "noNearbyLocationsFoundForThisLocation",
            "No nearby locations found for this location",
          )}
        </div>
      </section>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${nearbyTypographyScopeClass} px-6 py-8 md:px-8 md:py-10`}
          style={{
            backgroundColor: sectionBackground,
            color: sectionForeground,
          }}
        >
          <style>{nearbyTypographyStyles}</style>
          <style>{`
            .yfc-nearby-map .mapbox-static-map-shell,
            .yfc-nearby-map .mapbox-static-map-picture,
            .yfc-nearby-map .mapbox-static-map-image {
              width: 100%;
              height: 100%;
            }
            .yfc-nearby-map .mapbox-static-map-image {
              object-fit: cover;
              object-position: center;
            }
          `}</style>
          <div className="mx-auto max-w-[1440px]">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="mb-6 text-left text-[34px] font-bold leading-none md:text-[44px] lg:text-center"
                style={{
                  ...getTextStyle(props.heading.styles),
                  color: resolveTextColor(
                    props.heading.fontColor,
                    sectionForeground,
                  ),
                }}
              >
                {headingText}
              </h2>
            </EntityField>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="order-2 min-h-[280px] overflow-hidden rounded-[14px] bg-neutral-100 lg:order-1 lg:min-h-[420px] yfc-nearby-map">
                <EntityField
                  displayName="Map Coordinates"
                  fieldId={props.map.coordinate.field}
                  constantValueEnabled={
                    props.map.coordinate.constantValueEnabled
                  }
                  fullHeight
                  className="h-full"
                >
                  <MapboxStaticMapComponent
                    {...props.map}
                    id={`${props.id}-map`}
                    puck={props.puck}
                  />
                </EntityField>
              </div>
              <div className="order-1 grid gap-5 lg:order-2">
                {nearbyLocationDocs
                  .slice(0, props.limit)
                  .map((locationData: any, index: number) => {
                    const resolvedUrl = resolveUrlTemplate(
                      mergeMeta(locationData, streamDocument),
                      relativePrefixToRoot ?? "",
                    );
                    const miles = toMiles(
                      coordinate,
                      locationData.yextDisplayCoordinate,
                    );
                    const directionsLink = locationData.yextDisplayCoordinate
                      ? `https://www.google.com/maps/dir/?api=1&destination=${locationData.yextDisplayCoordinate.latitude},${locationData.yextDisplayCoordinate.longitude}`
                      : resolvedUrl;

                    return (
                      <article
                        key={locationData.id ?? locationData.name ?? index}
                        style={{ color: sectionForeground }}
                      >
                        <EntityField
                          displayName="Nearby Location Name"
                          fieldId="name"
                          constantValueEnabled={false}
                        >
                          <p
                            className="block text-[22px] font-bold leading-tight text-current"
                            style={{
                              ...getTextStyle(
                                props.nearbyLocationName.styles,
                              ),
                              color: resolveTextColor(
                                props.nearbyLocationName.fontColor,
                                sectionForeground,
                              ),
                            }}
                          >
                            {locationData.name}
                          </p>
                        </EntityField>
                        {locationData.address ? (
                          <EntityField
                            displayName="Nearby Address"
                            fieldId="address"
                            constantValueEnabled={false}
                          >
                            <div
                              className="mt-1 text-[14px] leading-6 text-current"
                              style={{
                                ...getTextStyle(props.nearbyAddress.styles),
                                color: resolveTextColor(
                                  props.nearbyAddress.fontColor,
                                  sectionForeground,
                                ),
                              }}
                            >
                              <Address
                                address={locationData.address as AddressType}
                                showRegion
                                showCountry={false}
                              />
                            </div>
                          </EntityField>
                        ) : null}
                        {locationData.mainPhone ? (
                          <EntityField
                            displayName="Nearby Phone"
                            fieldId="mainPhone"
                            constantValueEnabled={false}
                          >
                            <p
                              className="text-[14px] leading-6 text-current"
                              style={{
                                ...getTextStyle(props.nearbyPhone.styles),
                                color: resolveTextColor(
                                  props.nearbyPhone.fontColor,
                                  sectionForeground,
                                ),
                              }}
                            >
                              {locationData.mainPhone}
                            </p>
                          </EntityField>
                        ) : null}
                        {miles ? (
                          <p
                            className="text-[13px] leading-6 text-current"
                            style={{
                              ...getTextStyle(props.nearbyDistance.styles),
                              color: resolveTextColor(
                                props.nearbyDistance.fontColor,
                                sectionForeground,
                              ),
                            }}
                          >
                            {t("locatedMilesFromCurrentLocation", {
                              defaultValue:
                                "Located {{miles}} miles from our current location",
                              miles,
                            })}
                          </p>
                        ) : null}
                        <Link
                          cta={{ link: directionsLink, linkType: "URL" }}
                          eventName={`getDirections${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="yfc-nearby-directions mt-1 inline-flex text-[13px] font-medium text-current underline-offset-4"
                          style={{
                            ...getLinkStyle(props.getDirectionsLink.styles),
                            color: resolveTextColor(
                              props.getDirectionsLink.fontColor,
                              sectionForeground,
                            ),
                          }}
                        >
                          {t("getDirections", "Get Directions")}
                        </Link>
                      </article>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualNearbyLocationsSection: YextComponentConfig<NearbyLocationsProps> =
  {
    label: msg("components.nearbyLocationsSection", "Nearby Locations Section"),
    fields: NearbyFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: { defaultValue: "Where To Find Us" },
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
      nearbyLocationName: {
        fontColor: undefined,
        styles: {
          ...defaultTextStyles,
          fontWeight: "700",
        },
      },
      nearbyAddress: {
        fontColor: undefined,
        styles: defaultTextStyles,
      },
      nearbyPhone: {
        fontColor: undefined,
        styles: defaultTextStyles,
      },
      nearbyDistance: {
        fontColor: undefined,
        styles: {
          ...defaultTextStyles,
          fontSize: "13px",
        },
      },
      getDirectionsLink: {
        fontColor: undefined,
        styles: {
          ...defaultLinkStyles,
          fontSize: "13px",
          fontWeight: "500",
        },
      },
      radius: 10,
      limit: 3,
      map: {
        apiKey: "",
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "dark-v11",
        zoom: 12,
        height: "100%",
      },
    },
    render: (props) => <NearbyComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "FastCasualNearbyLocationsSection",
  displayName: "Nearby Locations Section",
  description: "Nearby Locations Section",
  pageSetTypes: ["ENTITY"],
};
