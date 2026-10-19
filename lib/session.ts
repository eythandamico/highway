import { headers } from "next/headers";
import { auth } from "./auth";
import { HttpError } from "./http";
export async function getUser() {const session=await auth().api.getSession({headers:await headers()});if(!session?.user.emailVerified)return null; return {id:session.user.id,name:session.user.name,email:session.user.email};}
export async function requireUser() {const user=await getUser();if(!user)throw new HttpError(401,"Sign in to continue.");return user;}
export type User=NonNullable<Awaited<ReturnType<typeof getUser>>>;
