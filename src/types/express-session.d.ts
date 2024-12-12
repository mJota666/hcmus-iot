// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    email:string;
    gender: string,
    dob: string,
    name: string,
    createdAt: string
  }
}
