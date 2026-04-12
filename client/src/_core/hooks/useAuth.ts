import { getLoginUrl } from "@/const";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } =
    options ?? {};
  const resolvedRedirectPath = redirectPath ?? "/login";
  const utils = trpc.useUtils();
  const firebaseAuth = useFirebaseAuth();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      try {
        await signOut(auth);
      } catch {
        // Ignore Firebase sign out errors and proceed with local cleanup.
      }
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const mergedUser = useMemo(() => {
    if (meQuery.data) {
      return meQuery.data;
    }

    if (firebaseAuth.user) {
      return {
        id: -1,
        openId: firebaseAuth.user.uid,
        name: firebaseAuth.user.displayName || firebaseAuth.user.email || "Usuário",
        email: firebaseAuth.user.email,
        role: "user" as const,
      };
    }

    return null;
  }, [meQuery.data, firebaseAuth.user]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(mergedUser)
    );
    return {
      user: mergedUser,
      loading: (meQuery.isLoading && !firebaseAuth.user) || logoutMutation.isPending || firebaseAuth.loading,
      error: meQuery.error ?? logoutMutation.error ?? firebaseAuth.error ?? null,
      isAuthenticated: Boolean(mergedUser),
    };
  }, [
    mergedUser,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    firebaseAuth.error,
    firebaseAuth.loading,
    firebaseAuth.user,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === resolvedRedirectPath) return;

    window.location.href = resolvedRedirectPath;
  }, [redirectOnUnauthenticated, resolvedRedirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    getOAuthLoginUrl: getLoginUrl,
  };
}
