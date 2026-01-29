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

export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment(
    $screenname: String
    $text: String
    $author: String
    $timestamp: AWSDateTime
  ) {
    onUpdateComment(
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
    $text: String
    $author: String
    $timestamp: AWSDateTime
  ) {
    onDeleteComment(
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
