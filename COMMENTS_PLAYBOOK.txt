# Comments Feature Playbook

A step-by-step guide for adding Figma-style visual feedback comments to your React prototype projects.

## Overview

This feature adds pin-based comments to any screen, allowing designers and stakeholders to click anywhere on the prototype to drop a pin and leave feedback at that exact location. Comments are stored in AWS AppSync (GraphQL) with real-time sync across users.

### Features
- 📍 Click anywhere to drop a comment pin
- 💬 Inline comment input at pin location
- 👁️ Toggle pin visibility
- 🔄 Real-time sync across users
- 📱 Hover to preview, click to expand

---

## Prerequisites

- React project (Vite or Create React App)
- AWS Account
- Node.js 18+

---

## Step 1: Install Dependencies

```bash
npm install aws-amplify @aws-amplify/ui-react
```

If using Cloudscape Design System:
```bash
npm install @cloudscape-design/components @cloudscape-design/global-styles
```

---

## Step 2: Set Up AWS AppSync

### 2.1 Create AppSync API

1. Go to AWS Console → AppSync → Create API
2. Choose "Build from scratch"
3. Name it (e.g., `prototype-comments-api`)
4. Click Create

### 2.2 Define Schema

In AppSync Console → Schema, paste:

```graphql
type Comment {
  screenname: String!
  timestamp: AWSDateTime!
  text: String!
  author: String!
  pinX: Float
  pinY: Float
}

type CommentConnection {
  items: [Comment]
  nextToken: String
}

input CreateCommentInput {
  screenname: String!
  text: String!
  author: String!
  timestamp: AWSDateTime!
  pinX: Float
  pinY: Float
}

input DeleteCommentInput {
  screenname: String!
  timestamp: AWSDateTime!
}

input UpdateCommentInput {
  screenname: String!
  timestamp: AWSDateTime!
  text: String
  author: String
  pinX: Float
  pinY: Float
}

input TableCommentFilterInput {
  screenname: TableStringFilterInput
  timestamp: TableStringFilterInput
  text: TableStringFilterInput
  author: TableStringFilterInput
}

input TableStringFilterInput {
  ne: String
  eq: String
  le: String
  lt: String
  ge: String
  gt: String
  contains: String
  notContains: String
  between: [String]
  beginsWith: String
}

type Query {
  getComment(screenname: String!, timestamp: AWSDateTime!): Comment
  listComments(filter: TableCommentFilterInput, limit: Int, nextToken: String): CommentConnection
}

type Mutation {
  createComment(input: CreateCommentInput!): Comment
  updateComment(input: UpdateCommentInput!): Comment
  deleteComment(input: DeleteCommentInput!): Comment
}

type Subscription {
  onCreateComment(screenname: String, text: String, author: String, timestamp: AWSDateTime): Comment
    @aws_subscribe(mutations: ["createComment"])
  onUpdateComment(screenname: String, text: String, author: String, timestamp: AWSDateTime): Comment
    @aws_subscribe(mutations: ["updateComment"])
  onDeleteComment(screenname: String, text: String, author: String, timestamp: AWSDateTime): Comment
    @aws_subscribe(mutations: ["deleteComment"])
}
```

Click "Save Schema"

### 2.3 Create DynamoDB Data Source

1. Go to Data Sources → Create data source
2. Name: `CommentsTable`
3. Type: Amazon DynamoDB
4. Create new table or use existing
5. Table name: `comments`
6. Primary key: `screenname` (String)
7. Sort key: `timestamp` (String)

### 2.4 Attach Resolvers

For each Query/Mutation, attach resolvers to the DynamoDB data source:

**listComments resolver (Request mapping):**
```velocity
{
  "version": "2017-02-28",
  "operation": "Scan",
  #if($ctx.args.filter)
    "filter": $util.transform.toDynamoDBFilterExpression($ctx.args.filter)
  #end
  #if($ctx.args.limit)
    ,"limit": $ctx.args.limit
  #end
  #if($ctx.args.nextToken)
    ,"nextToken": "$ctx.args.nextToken"
  #end
}
```

**listComments resolver (Response mapping):**
```velocity
$util.toJson($ctx.result)
```

**createComment resolver (Request mapping):**
```velocity
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "screenname": $util.dynamodb.toDynamoDBJson($ctx.args.input.screenname),
    "timestamp": $util.dynamodb.toDynamoDBJson($ctx.args.input.timestamp)
  },
  "attributeValues": {
    "text": $util.dynamodb.toDynamoDBJson($ctx.args.input.text),
    "author": $util.dynamodb.toDynamoDBJson($ctx.args.input.author),
    "pinX": $util.dynamodb.toDynamoDBJson($ctx.args.input.pinX),
    "pinY": $util.dynamodb.toDynamoDBJson($ctx.args.input.pinY)
  }
}
```

**createComment resolver (Response mapping):**
```velocity
$util.toJson($ctx.result)
```

**deleteComment resolver (Request mapping):**
```velocity
{
  "version": "2017-02-28",
  "operation": "DeleteItem",
  "key": {
    "screenname": $util.dynamodb.toDynamoDBJson($ctx.args.input.screenname),
    "timestamp": $util.dynamodb.toDynamoDBJson($ctx.args.input.timestamp)
  }
}
```

**deleteComment resolver (Response mapping):**
```velocity
$util.toJson($ctx.result)
```

### 2.5 Configure API Key Authentication

1. Go to Settings → Default authorization mode
2. Select "API Key"
3. Create or note your API key

### 2.6 Get Your API Details

From AppSync Console, note:
- GraphQL endpoint URL
- API Key
- Region

---

## Step 3: Add Project Files

### 3.1 Create `src/aws-exports.js`

```javascript
const awsconfig = {
  API: {
    GraphQL: {
      endpoint: 'YOUR_APPSYNC_ENDPOINT',
      region: 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'YOUR_API_KEY'
    }
  }
};

export default awsconfig;
```

### 3.2 Create `src/graphql/queries.js`

```javascript
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: TableCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        screenname
        text
        author
        timestamp
        pinX
        pinY
      }
      nextToken
    }
  }
`;

export const getComment = /* GraphQL */ `
  query GetComment($screenname: String!, $timestamp: AWSDateTime!) {
    getComment(screenname: $screenname, timestamp: $timestamp) {
      screenname
      text
      author
      timestamp
      pinX
      pinY
    }
  }
`;
```

### 3.3 Create `src/graphql/mutations.js`

```javascript
export const createComment = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      screenname
      text
      author
      timestamp
      pinX
      pinY
    }
  }
`;

export const updateComment = /* GraphQL */ `
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      screenname
      text
      author
      timestamp
      pinX
      pinY
    }
  }
`;

export const deleteComment = /* GraphQL */ `
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      screenname
      text
      author
      timestamp
      pinX
      pinY
    }
  }
`;
```

### 3.4 Create `src/graphql/subscriptions.js`

```javascript
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment(
    $screenname: String
    $text: String
    $author: String
    $timestamp: AWSDateTime
  ) {
    onCreateComment(
      screenname: $screenname
      text: $text
      author: $author
      timestamp: $timestamp
    ) {
      screenname
      text
      author
      timestamp
      pinX
      pinY
    }
  }
`;

export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment(
    $screenname: String
  ) {
    onDeleteComment(
      screenname: $screenname
    ) {
      screenname
      timestamp
    }
  }
`;
```

### 3.5 Create `src/components/CommentsPanel.jsx`

```jsx
import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

const client = generateClient();

function CommentsPanel({ screenName }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentMode, setCommentMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [showPins, setShowPins] = useState(true);
  const [expandedComment, setExpandedComment] = useState(null);
  const textareaRef = useRef(null);

  const storageKey = `comments-${screenName}`;

  useEffect(() => {
    fetchComments();
    
    const subscription = client.graphql({
      query: subscriptions.onCreateComment,
      variables: { screenname: screenName }
    }).subscribe({
      next: ({ data }) => {
        const newComment = data.onCreateComment;
        setComments(prev => [newComment, ...prev]);
      },
      error: (error) => console.error('Subscription error:', error)
    });

    return () => subscription.unsubscribe();
  }, [screenName]);

  // Handle click to place pin
  useEffect(() => {
    if (!commentMode) return;

    const handleClick = (e) => {
      if (e.target.closest('[data-comments-panel]')) return;
      
      const x = e.clientX;
      const y = e.clientY;
      
      setPendingPin({ x, y });
      setCommentMode(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [commentMode]);

  // Focus textarea when pin is placed
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
      const result = await client.graphql({
        query: queries.listComments,
        variables: {
          filter: { screenname: { eq: screenName } }
        }
      });
      
      const items = result.data.listComments.items || [];
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
        const commentWithId = { ...comment, id: Date.now().toString() };
        setComments([commentWithId, ...comments]);
        localStorage.setItem(storageKey, JSON.stringify([commentWithId, ...comments]));
        setNewComment('');
        setPendingPin(null);
      }
    }
  };

  const handleDeleteComment = async (comment) => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
    if (e.key === 'Escape') {
      setPendingPin(null);
      setNewComment('');
    }
  };

  const formatTimestamp = (timestamp) => {
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
            position: 'fixed',
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
            position: 'fixed',
            left: comment.pinX - 12,
            top: comment.pinY - 24,
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
              <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>
                {comment.author}
              </div>
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
```

---

## Step 4: Configure Your App

### 4.1 Update `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@cloudscape-design/global-styles/index.css'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'
import awsconfig from './aws-exports.js'

Amplify.configure(awsconfig);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## Step 5: Add Comments to Your Screens

Import and add the CommentsPanel to any screen:

```jsx
import CommentsPanel from './components/CommentsPanel';

function MyScreen() {
  return (
    <div>
      {/* Your screen content */}
      
      <CommentsPanel screenName="My Screen Name" />
    </div>
  );
}
```

The `screenName` prop identifies which screen the comments belong to. Use unique names for each screen.

---

## How It Works

1. Click **"📍 Add comment"** button to enter comment mode
2. Click anywhere on the screen to drop a pin
3. An inline comment box appears at that location
4. Type your comment and press **Enter** (or click Comment)
5. Press **Esc** to cancel
6. Click on existing pins to view/delete comments
7. Hover over pins to see a preview
8. Use **"👁️ Hide/View comments"** to toggle pin visibility

---

## Step 6: Optional - Email Notifications

To receive email notifications when comments are added:

### 6.1 Create SNS Topic

1. Go to AWS Console → SNS → Create topic
2. Type: Standard
3. Name: `comment-notifications`
4. Create subscription → Email → Your email
5. Confirm the subscription email

### 6.2 Enable DynamoDB Streams

1. Go to DynamoDB → Your comments table
2. Exports and streams → Turn on DynamoDB stream
3. Select "New image"

### 6.3 Create Lambda Function

1. Go to Lambda → Create function
2. Name: `comment-notification`
3. Runtime: Node.js 20.x
4. Add this code:

```javascript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({});

export const handler = async (event) => {
    const topicArn = process.env.SNS_TOPIC_ARN;
    
    for (const record of event.Records) {
        if (record.eventName === "INSERT") {
            const newImage = record.dynamodb.NewImage;
            const screenName = newImage.screenname?.S || 'Unknown';
            const text = newImage.text?.S || '';
            const author = newImage.author?.S || 'Anonymous';
            
            const message = `New comment on "${screenName}" by ${author}:\n\n${text}`;
            
            await sns.send(new PublishCommand({
                TopicArn: topicArn,
                Subject: `New Comment on ${screenName}`,
                Message: message
            }));
        }
    }
    
    return { statusCode: 200 };
};
```

5. Add environment variable: `SNS_TOPIC_ARN` = your topic ARN
6. Add DynamoDB trigger → Select your comments table stream
7. Attach IAM policies: `AWSLambdaDynamoDBExecutionRole` and `AmazonSNSFullAccess`

---

## Troubleshooting

### Comments not loading
- Check browser console for errors
- Verify AppSync endpoint and API key in `aws-exports.js`
- Ensure DynamoDB table exists with correct schema

### Pin positions not saving
- Ensure `pinX` and `pinY` are in your AppSync schema
- Update the createComment resolver to include pinX and pinY

### Real-time updates not working
- Verify subscriptions are enabled in AppSync
- Check WebSocket connection in browser Network tab

### Build fails on deployment
- Add `aws-exports.js` to `.gitignore`
- Use environment variables for production:
  - `VITE_APPSYNC_ENDPOINT`
  - `VITE_APPSYNC_REGION`
  - `VITE_APPSYNC_API_KEY`

---

## File Structure

```
src/
├── components/
│   └── CommentsPanel.jsx
├── graphql/
│   ├── mutations.js
│   ├── queries.js
│   └── subscriptions.js
├── aws-exports.js
└── main.jsx
```

---

## Security Notes

- API keys are suitable for prototypes but not production
- For production, use Cognito authentication
- Never commit `aws-exports.js` with real credentials to public repos
- Use environment variables for deployed applications
