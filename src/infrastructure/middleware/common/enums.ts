// src/common/enums.ts (o donde definas tus tipos/enums compartidos)

/**
 * Define los posibles roles de usuario en el sistema.
 */
export enum UserRole {
    User = 'user',
    Admin = 'admin',
    Campesino = 'campesino', // Considera si 'Farmer' o 'Producer' sería más estándar en inglés
    Supervisor = 'supervisor',
  }
  
  /**
   * Define los posibles estados de activación de un usuario.
   */
  export enum UserStatus {
    Active = 'Activado', // Considera 'Active' si prefieres inglés
    Inactive = 'Desactivado', // Considera 'Inactive' si prefieres inglés
  }
  
