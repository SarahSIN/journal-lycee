// Types pour les interactions (commentaires, likes) du journal de lycée

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  createdAt: Date;
  username: string;
  profilePictureUrl?: string;
}

export interface Like {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface Interaction {
  comments: Comment[];
  likes: number;
  userHasLiked: boolean;
}