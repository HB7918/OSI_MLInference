import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

const client = generateClient();

interface Comment {
  screenname: string;
  text: string;
  author: string;
  timestamp: string;
  pinX?: number;
  pinY?: number;
}

interface CommentsPanelProps {
  screenName: string;
}

function CommentsPanel({ screenName }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [_loading, setLoading] = useState(true);
  const [commentMode, setCommentMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [showPins, setShowPins] = useState(true);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const storageKey = `comments-${screenName}`;

  useEffect(() => {
    fetchComments();

    const sub = client.graphql({
      query: subscriptions.onCreateComment,
      variables: { screenname: screenName }
    }) as any;
    
    const subscription = sub.subscribe({
      next: ({ data }: any) => {
        const newComment = data.onCreateComment;
        setComments(prev => [newComment, ...prev]);
      },
      error: (error: any) => console.error('Subscription error:', error)
    });

    return () => subscription.unsubscribe();
  }, [screenName]);

  useEffect(() => {
    if (!commentMode) return;

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-comments-panel]')) return;
      // Use pageX/pageY to get document-relative coordinates (includes scroll offset)
      const x = e.pageX;
      const y = e.pageY;
      setPendingPin({ x, y });
      setCommentMode(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [commentMode]);

  useEffect(() => {
    if (pendingPin && textareaRef.current) {
      setTimeout(() => {
        const textarea = textareaRef.current?.querySelector('textarea');
        textarea?.focus();
      }, 100);
    }
  }, [pendingPin]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const result: any = await client.graphql({
        query: queries.listComments,
        variables: {
          filter: { screenname: { eq: screenName } }
        }
      });
      const items = result.data.listComments.items || [];
      items.sort((a: Comment, b: Comment) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setComments(items);
    } catch (err) {
      console.error('Error fetching comments:', err);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && pendingPin) {
      const timestamp = new Date().toISOString();
      const comment = {
        screenname: screenName,
        text: newComment,
        author: 'User',
        timestamp: timestamp,
        pinX: pendingPin.x,
        pinY: pendingPin.y
      };

      try {
        await client.graphql({
          query: mutations.createComment,
          variables: { input: comment }
        });
        setNewComment('');
        setPendingPin(null);
      } catch (error) {
        console.error('Error adding comment:', error);
        const commentWithId = { ...comment };
        setComments([commentWithId, ...comments]);
        localStorage.setItem(storageKey, JSON.stringify([commentWithId, ...comments]));
        setNewComment('');
        setPendingPin(null);
      }
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    try {
      await client.graphql({
        query: mutations.deleteComment,
        variables: { 
          input: { 
            screenname: comment.screenname,
            timestamp: comment.timestamp
          } 
        }
      });
      setComments(comments.filter(c => c.timestamp !== comment.timestamp));
      setExpandedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      const filtered = comments.filter(c => c.timestamp !== comment.timestamp);
      setComments(filtered);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      setExpandedComment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
    if (e.key === 'Escape') {
      setPendingPin(null);
      setNewComment('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pinnedComments = comments.filter(c => c.pinX && c.pinY);

  return (
    <>
      {/* Comment Mode Overlay */}
      {commentMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'crosshair',
          zIndex: 998,
          backgroundColor: 'rgba(0,0,0,0.02)'
        }} />
      )}

      {/* Inline Comment Input at Pin Location */}
      {pendingPin && (
        <div
          data-comments-panel
          style={{
            position: 'absolute',
            left: pendingPin.x,
            top: pendingPin.y,
            zIndex: 1002
          }}
        >
          {/* Pin marker */}
          <div style={{
            position: 'absolute',
            left: -12,
            top: -24,
            width: '24px',
            height: '24px',
            backgroundColor: '#0972d3',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <span style={{
              transform: 'rotate(45deg)',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>+</span>
          </div>

          {/* Comment input box */}
          <div style={{
            marginLeft: '20px',
            marginTop: '-10px',
            width: '280px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div ref={textareaRef}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Enter to submit, Esc to cancel)"
                style={{
                  width: '100%',
                  border: 'none',
                  padding: '12px',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  minHeight: '60px',
                  boxSizing: 'border-box'
                }}
                rows={2}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '8px 12px',
              borderTop: '1px solid #eee',
              backgroundColor: '#fafafa'
            }}>
              <button
                onClick={() => {
                  setPendingPin(null);
                  setNewComment('');
                }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: newComment.trim() ? '#0972d3' : '#ccc',
                  color: 'white',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Comment Pins */}
      {showPins && pinnedComments.map((comment, index) => (
        <div
          key={comment.timestamp}
          data-comments-panel
          style={{
            position: 'absolute',
            left: (comment.pinX || 0) - 12,
            top: (comment.pinY || 0) - 24,
            zIndex: expandedComment === comment.timestamp ? 1002 : 1001
          }}
        >
          {/* Pin marker */}
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: hoveredPin === comment.timestamp || expandedComment === comment.timestamp ? '#ec7211' : '#0972d3',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredPin(comment.timestamp)}
            onMouseLeave={() => setHoveredPin(null)}
            onClick={() => setExpandedComment(expandedComment === comment.timestamp ? null : comment.timestamp)}
          >
            <span style={{
              transform: 'rotate(45deg)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>{index + 1}</span>
          </div>

          {/* Hover tooltip */}
          {hoveredPin === comment.timestamp && expandedComment !== comment.timestamp && (
            <div style={{
              position: 'absolute',
              left: '32px',
              top: '-5px',
              backgroundColor: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              maxWidth: '200px',
              zIndex: 1003
            }}>
              <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>{comment.author}</div>
              <div style={{ fontSize: '12px', color: '#545b64' }}>
                {comment.text.length > 60 ? comment.text.substring(0, 60) + '...' : comment.text}
              </div>
            </div>
          )}

          {/* Expanded comment card */}
          {expandedComment === comment.timestamp && (
            <div style={{
              position: 'absolute',
              left: '32px',
              top: '-5px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              width: '280px',
              zIndex: 1003
            }}>
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{comment.author}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{formatTimestamp(comment.timestamp)}</div>
                  </div>
                  <button
                    onClick={() => setExpandedComment(null)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#888',
                      padding: '0',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#16191f' }}>
                  {comment.text}
                </div>
              </div>
              <div style={{
                borderTop: '1px solid #eee',
                padding: '8px 12px',
                backgroundColor: '#fafafa',
                borderRadius: '0 0 8px 8px'
              }}>
                <button
                  onClick={() => handleDeleteComment(comment)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#d13212',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px 0'
                  }}
                >
                  Delete comment
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Floating Controls */}
      <div
        data-comments-panel
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1003,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <button
          onClick={() => {
            setCommentMode(!commentMode);
            if (commentMode) {
              setPendingPin(null);
            }
            setExpandedComment(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: commentMode ? '#0972d3' : '#ffffff',
            color: commentMode ? '#ffffff' : '#16191f',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '16px' }}>📍</span>
          {commentMode ? 'Click to place pin' : 'Add comment'}
        </button>

        {pinnedComments.length > 0 && (
          <button
            onClick={() => setShowPins(!showPins)}
            style={{
              backgroundColor: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#16191f'
            }}
          >
            <span style={{ fontSize: '14px' }}>👁️</span>
            {showPins ? 'Hide' : `View comments (${pinnedComments.length})`}
          </button>
        )}
      </div>
    </>
  );
}

export default CommentsPanel;
