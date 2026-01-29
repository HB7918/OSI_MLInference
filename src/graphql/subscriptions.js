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
  subscription OnDeleteComment($screenname: String) {
    onDeleteComment(screenname: $screenname) {
      screenname
      timestamp
    }
  }
`;
