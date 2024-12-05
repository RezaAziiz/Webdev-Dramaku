import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment }) => {
    const generateAvatar = (username) => {
        if (!username || typeof username !== 'string') {
            username = 'Unknown';
        }
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        const initial = username.charAt(0).toUpperCase();
        return { color, initial };
    };

    const avatar = generateAvatar(comment.user);

    // Validate the date
    const date = new Date(comment.date);
    const formattedDate = isNaN(date.getTime()) ? 'Invalid date' : formatDistanceToNow(date, { addSuffix: true });

    return (
        <div className="flex items-start p-4 border-b border-gray-400">
            <div
                className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold"
                style={{ backgroundColor: avatar.color }}
            >
                {avatar.initial}
            </div>
            <div className="ml-4">
                <p className="font-bold text-gray-200">{comment.user || 'Unknown User'}</p>
                <p className="text-gray-400 text-sm">{formattedDate}</p>
                <p className="text-lg">
                    <span className="text-yellow-500">{"★".repeat(comment.rating)}</span>
                    <span className="text-gray-400">{"★".repeat(5 - comment.rating)}</span>
                </p>
                <p className="text-gray-200">{comment.text}</p>
            </div>
        </div>
    );
};

const CommentList = ({ comments }) => {
    return (
        <div className="max-h-60 overflow-y-auto pl-2 pr-5">
            {comments && comments.length > 0 ? (
                comments.map((comment, index) => (
                    <Comment key={index} comment={comment} />
                ))
            ) : (
                <p className="text-gray-400">No comments available for this movie.</p>
            )}
        </div>
    );
};

export default CommentList;
