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
