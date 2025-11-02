import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments, addComment, selectComments } from "../../slices/commentsSlice";

const Comments = ({ productId, user }) => {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (productId) dispatch(fetchComments(productId));
  }, [productId, dispatch]);

  const handleAddComment = () => {
    if (!user) return alert("Please login to comment");
    if (!newComment.trim()) return;
    dispatch(addComment({ productId, userId: user.id, content: newComment }));
    setNewComment("");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Comments</h3>
      {user && (
        <div>
          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." />
          <button onClick={handleAddComment}>Add</button>
        </div>
      )}
      {comments.length ? (
        <ul>
          {comments.map(c => (
            <li key={c.id}><strong>{c.user_id}</strong> — {c.created_at || ""}<p>{c.content}</p></li>
          ))}
        </ul>
      ) : <p>No comments yet.</p>}
    </div>
  );
};

export default Comments;
