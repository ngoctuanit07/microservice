export class Team {
  id!: number;
  name!: string;
  description?: string;
  organizationId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  users?: UserTeam[];
  hosts?: HostTeam[];
}

export class UserTeam {
  userId!: number;
  teamId!: number;
  role!: string;
  createdAt!: Date;
  user?: User;
  team?: Team;
}

export class HostTeam {
  hostId!: number;
  teamId!: number;
  createdAt!: Date;
  host?: Host;
  team?: Team;
}

// References to other entities
interface User {
  id: number;
  email: string;
  name?: string;
}

interface Host {
  id: number;
  ip: string;
  port: number;
  uid: string;
}
