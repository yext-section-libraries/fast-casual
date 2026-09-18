import type { SectionConfig } from "@yext/visual-editor";
import { msg } from "@yext/visual-editor";
import {
  getScopedTypographyStyles,
  getTextStyle,
  getThemeColorCssValue,
  resolveTextColor,
} from "../shared/styleHelpers";

import * as React from "react";
import { useTranslation } from "react-i18next";
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
  cardBackgroundColor: {
    label: msg("fields.cardBackgroundColor", "Card Background Color"),
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
  reviewerName: {
    label: msg("fields.reviewerName", "Reviewer Name"),
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
  reviewText: {
    label: msg("fields.reviewText", "Review Text"),
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
};

const renderStarRating = (rating: number): string => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(roundedRating)}${"☆".repeat(5 - roundedRating)}`;
};

const reviewsTypographyScopeClass = "yfc-reviews-typography";

const reviewsTypographyStyles = getScopedTypographyStyles(
  reviewsTypographyScopeClass,
);

const ReviewsComponent: PuckComponent<ReviewsProps> = (props) => {
  const { t } = useTranslation();
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
    getThemeColorCssValue(props.section.backgroundColor.contrastingColor) ??
    "#000000";
  const cardForeground =
    getThemeColorCssValue(props.cardBackgroundColor.contrastingColor) ??
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
            {t("noFirstPartyReviews", "No first-party reviews")}
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
            backgroundColor: getThemeColorCssValue(props.section.backgroundColor),
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
                    ...getTextStyle(props.heading.styles),
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
                  {t("averageRatingFromReviews", {
                    averageRating: averageRating?.toFixed(1),
                    count: reviewCount,
                    defaultValue_one:
                      "{{averageRating}} average rating from {{count}} review",
                    defaultValue_other:
                      "{{averageRating}} average rating from {{count}} reviews",
                  })}
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
                      backgroundColor: getThemeColorCssValue(
                        props.cardBackgroundColor,
                      ),
                      color: cardForeground,
                    }}
                  >
                    <h3
                      className="mb-2 text-[18px] font-bold text-current"
                      style={{
                        ...getTextStyle(props.reviewerName.styles),
                        color: resolveTextColor(
                          props.reviewerName.fontColor,
                          cardForeground,
                        ),
                      }}
                    >
                      {review.authorName || t("anonymous", "Anonymous")}
                    </h3>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-current">
                      <span>
                        {t("ratingInStars", {
                          defaultValue: "{{rating}} Stars",
                          rating: (review.rating ?? averageRating ?? 0).toFixed(
                            1,
                          ),
                        })}
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
                        ...getTextStyle(props.reviewText.styles),
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
  label: msg("components.reviewsSection", "Reviews Section"),
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
