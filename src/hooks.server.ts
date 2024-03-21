import { lucia } from "$lib/server/auth";
import { redirect, type Handle } from "@sveltejs/kit";
import { isEmailVerified } from "$lib/server/db/queries/user";
// Enum for allowed routes per provider
enum AllowedRoutes {
    Signup = "/signup",
    Validate = "/signup/validate",
    Discord = "/login/discord",
    DiscordCallback = "/login/discord/callback"
}

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
       
        // Check if the current route is not the login page or any of the allowed routes
        if (
            event.url.pathname !== "/login" &&
            !Object.values(AllowedRoutes).includes(event.url.pathname as AllowedRoutes)
        )
       
        {
            // Redirect to the login page if the user is not logged in
            throw redirect(302, "/login");
        }
       
        return resolve(event);
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
       
        // Check if the current route is not the login page or any of the allowed routes
        if (
            event.url.pathname !== "/login" &&
            !Object.values(AllowedRoutes).includes(event.url.pathname as AllowedRoutes)
        )
       
        {
            // Redirect to the login page if the user is not logged in
            throw redirect(302, "/login");
        }
    }

    // Vérifiez si l'email de l'utilisateur est vérifié
    if (user && !(await isEmailVerified(user.id))) {
        // Redirigez vers /signup/validate si l'email n'est pas vérifié
        throw redirect(302, "/signup/validate");
    }

    event.locals.user = user;
    event.locals.session = session;
    return resolve(event);
};