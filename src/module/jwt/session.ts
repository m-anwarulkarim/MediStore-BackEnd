import { auth } from "../../lib/auth";

// ✅ Session বের করার safe helper (different better-auth versions support different APIs)
export async function getBetterAuthSession(req: any) {
    const headers = req?.headers;

    // Variant A: auth.api.getSession({ headers })
    const apiGetSession = (auth as any)?.api?.getSession;
    if (typeof apiGetSession === "function") {
        return apiGetSession({ headers });
    }

    // Variant B: auth.getSession({ headers })
    const getSession = (auth as any)?.getSession;
    if (typeof getSession === "function") {
        return getSession({ headers });
    }

    // Variant C: auth.api.getSession(headers) (rare)
    if (typeof apiGetSession === "function") {
        return apiGetSession(headers);
    }

    throw new Error(
        "better-auth session method not found. Check your lib/auth export.",
    );
}