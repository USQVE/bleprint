import React from 'react';
import { CommentBox as CommentBoxType } from '../types';

interface CommentBoxProps {
  box: CommentBoxType;
}

const CommentBox: React.FC<CommentBoxProps> = ({ box }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        borderRadius: 12,
        border: '2px dashed rgba(150, 180, 220, 0.3)',
        background: 'rgba(100, 150, 200, 0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          fontSize: 13,
          fontWeight: 700,
          color: 'rgba(150, 180, 220, 0.85)',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}
      >
        {box.title}
      </div>
    </div>
  );
};

export default CommentBox;
