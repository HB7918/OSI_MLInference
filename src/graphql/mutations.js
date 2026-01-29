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
