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
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        border: '2px solid rgba(100, 200, 255, 0.3)',
        borderRadius: '8px',
        background: 'rgba(30, 60, 100, 0.05)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '12px 16px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(100, 200, 255, 0.05)',
        pointerEvents: 'none'
      }}
    >
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'rgba(100, 200, 255, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}
      >
        📝 {box.title}
      </span>
    </div>
  );
};

export default CommentBox;
