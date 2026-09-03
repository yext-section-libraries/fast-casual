import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  StyledTextValue,
  ThemeColor,
  TranslatableString,
  VisibilityWrapper,
  YextComponentConfig,
  YextEntityField,
  YextFields,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";

type Review = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
  comments?: { content?: string; commentDate?: string }[];
};

type ReviewsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  cardBackgroundColor: ThemeColor;
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  reviewerName: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  reviewText: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

const ReviewsFields: YextFields<ReviewsProps> = {
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
  cardBackgroundColor: {
    label: "Card Background Color",
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
  reviewerName: {
    label: "Reviewer Name",
    type: "object",
    objectFields: {
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
  reviewText: {
    label: "Review Text",
    type: "object",
    objectFields: {
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
};

const textStylesToCss = (styles: StyledTextValue) => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const colorValueToCss = (color?: ThemeColor | string) => {
  if (!color) {
    return undefined;
  }

  const selectedColor = typeof color === "string" ? color : color.selectedColor;

  if (selectedColor.startsWith("[") && selectedColor.endsWith("]")) {
    return selectedColor.slice(1, -1);
  }

  switch (selectedColor) {
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
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
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
    default:
      return selectedColor;
  }
};

const themeColorToCss = (color?: ThemeColor | string) => colorValueToCss(color);

const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  fallbackColor: ThemeColor | string,
) => themeColorToCss(fontColor) ?? colorValueToCss(fallbackColor);

const renderStarRating = (rating: number): string => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(roundedRating)}${"☆".repeat(5 - roundedRating)}`;
};

const reviewsTypographyScopeClass = "yfc-reviews-typography";

const reviewsTypographyStyles = `
  .${reviewsTypographyScopeClass} p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${reviewsTypographyScopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }
  .${reviewsTypographyScopeClass} h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }
  .${reviewsTypographyScopeClass} h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }
  .${reviewsTypographyScopeClass} h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }
  .${reviewsTypographyScopeClass} h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }
  .${reviewsTypographyScopeClass} h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }
  .${reviewsTypographyScopeClass} h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }
  .${reviewsTypographyScopeClass} a:not(.font-button-fontFamily) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: none;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
  .${reviewsTypographyScopeClass} a:not(.font-button-fontFamily):hover {
    text-decoration: underline;
  }
`;

const ReviewsComponent: PuckComponent<ReviewsProps> = (props) => {
  const streamDocument = useDocument<{
    locale?: string;
    ref_reviewsAgg?: { publisher?: string; topReviews?: Review[] }[];
  }>();
  const locale = streamDocument.locale ?? "en-US";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const scopeName = `YextFastCasualReviewsSection${getAnalyticsScopeHash(props.id)}`;
  const headingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const sectionForeground =
    themeColorToCss(props.section.backgroundColor.contrastingColor) ??
    "#000000";
  const cardForeground =
    themeColorToCss(props.cardBackgroundColor.contrastingColor) ??
    sectionForeground;

  if (!reviews.length) {
    if (!props.puck.isEditing) {
      return <></>;
    }

    return (
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section className={`${reviewsTypographyScopeClass} px-6 py-8 md:px-8`}>
          <style>{reviewsTypographyStyles}</style>
          <div className="mx-auto max-w-[1440px] rounded-[14px] border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
            No first-party reviews
          </div>
        </section>
      </VisibilityWrapper>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider name={scopeName}>
        <section
          className={`${reviewsTypographyScopeClass} bg-white px-6 py-8 md:px-8 md:py-10`}
          style={{
            backgroundColor: themeColorToCss(props.section.backgroundColor),
          }}
        >
          <style>{reviewsTypographyStyles}</style>
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-6 text-left lg:text-center">
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  className="mb-2 text-[34px] font-bold leading-none md:text-[44px]"
                  style={{
                    ...textStylesToCss(props.heading.styles),
                    color: resolveTextColor(
                      props.heading.fontColor,
                      props.section.backgroundColor.contrastingColor,
                    ),
                  }}
                >
                  {headingText}
                </h2>
              </EntityField>
              <EntityField
                displayName="Review Summary"
                fieldId="ref_reviewsAgg"
                constantValueEnabled={false}
              >
                <p className="text-[14px]" style={{ color: sectionForeground }}>
                  {averageRating?.toFixed(1)} average rating from {reviewCount}{" "}
                  reviews
                </p>
              </EntityField>
            </div>
            <EntityField
              displayName="First Party Reviews"
              fieldId="ref_reviewsAgg"
              constantValueEnabled={false}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {reviews.slice(0, 4).map((review, index) => (
                  <article
                    key={`${review.authorName}-${index}`}
                    className="rounded-[12px] p-5"
                    style={{
                      backgroundColor: themeColorToCss(
                        props.cardBackgroundColor,
                      ),
                      color: cardForeground,
                    }}
                  >
                    <h3
                      className="mb-2 text-[18px] font-bold text-current"
                      style={{
                        ...textStylesToCss(props.reviewerName.styles),
                        color: resolveTextColor(
                          props.reviewerName.fontColor,
                          cardForeground,
                        ),
                      }}
                    >
                      {review.authorName || "Anonymous"}
                    </h3>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-current">
                      <span>
                        {(review.rating ?? averageRating ?? 0).toFixed(1)} Stars
                      </span>
                      <span>
                        {renderStarRating(review.rating ?? averageRating ?? 0)}
                      </span>
                      <span>|</span>
                      <time>
                        {review.reviewDate
                          ? new Date(review.reviewDate).toLocaleDateString(
                              locale ?? "en-US",
                            )
                          : ""}
                      </time>
                    </div>
                    <p
                      className="text-[14px] leading-6 text-current"
                      style={{
                        ...textStylesToCss(props.reviewText.styles),
                        color: resolveTextColor(
                          props.reviewText.fontColor,
                          cardForeground,
                        ),
                      }}
                    >
                      {review.content}
                    </p>
                  </article>
                ))}
              </div>
            </EntityField>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const FastCasualReviewsSection: YextComponentConfig<ReviewsProps> = {
  label: "Reviews Section",
  fields: ReviewsFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      visibleOnLivePage: true,
    },
    cardBackgroundColor: {
      selectedColor: "palette-quaternary",
      contrastingColor: "palette-quaternary-contrast",
    },
    heading: {
      text: {
        field: "",
        constantValue: { defaultValue: "Reviews" },
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
    reviewerName: {
      fontColor: undefined,
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
    },
    reviewText: {
      fontColor: undefined,
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
    },
  },
  render: (props) => <ReviewsComponent {...props} />,
};

export const config: SectionConfig = {
  id: "FastCasualReviewsSection",
  displayName: "Reviews Section",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
