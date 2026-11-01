// The public reference demo has no authentication or live workspace transport.
export function useSession() {
  return { user: null as { id: string } | null, openSignIn: () => {}, signOut: async () => {} };
}
