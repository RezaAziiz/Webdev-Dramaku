import React from "react";
import CommentList from "../comment";
import SelectMenu from "../ui/SelectMenu";

const ratingOptions = (placeholderLabel) => [
  { value: 0, label: placeholderLabel },
  ...[5, 4, 3, 2, 1].map((score) => ({
    value: score,
    label: `${score} star${score > 1 ? "s" : ""}`,
  })),
];

const CommentsSection = ({
  isLoggedIn,
  comments,
  filterRating,
  isCommentFormVisible,
  rating,
  commentText,
  displayComments,
  onFilterRatingChange,
  onToggleCommentForm,
  onRatingChange,
  onCommentTextChange,
  onSubmit,
}) => (
  <section
    className="detail-section detail-comments glass-surface"
    aria-labelledby="comments-title"
  >
    <div className="detail-section-heading detail-comments-heading">
      <div>
        <span className="detail-eyebrow">Community</span>
        <h2 id="comments-title">Comments</h2>
      </div>
      {isLoggedIn ? (
        <button
          type="button"
          className="detail-button detail-button--secondary"
          onClick={onToggleCommentForm}
        >
          {isCommentFormVisible ? "Cancel" : "Add comment"}
        </button>
      ) : (
        <p>Please log in to add a comment.</p>
      )}
    </div>

    <div className="detail-comment-tools">
      <span>{comments.length} comments</span>
      <div className="detail-comment-field">
        <span>Filter rating</span>
        <SelectMenu
          ariaLabel="Filter comments by rating"
          value={filterRating}
          options={ratingOptions("All ratings")}
          onChange={(score) => onFilterRatingChange(Number(score))}
        />
      </div>
    </div>

    {isCommentFormVisible && (
      <form
        className="detail-comment-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="detail-comment-field">
          <span>Your rating</span>
          <SelectMenu
            ariaLabel="Your rating"
            value={rating}
            options={ratingOptions("Choose a rating")}
            onChange={(score) => onRatingChange(Number(score))}
          />
        </div>
        <label>
          <span>Your comment</span>
          <textarea
            rows="3"
            placeholder="Write your comment…"
            value={commentText}
            onChange={(event) => onCommentTextChange(event.target.value)}
          />
        </label>
        <button type="submit" className="detail-button detail-button--primary">
          Submit comment
        </button>
      </form>
    )}

    <CommentList comments={displayComments} />
  </section>
);

export default CommentsSection;
