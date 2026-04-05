// Types pour les utilisateurs du journal de lycée

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  profilePictureUrl?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  profilePictureUrl?: string;
}