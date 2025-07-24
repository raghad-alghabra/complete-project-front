import { NextResponse } from "next/server";

export function middleware(req) {
    const token = req.cookies.get("authToken")?.value; // جلب التوكن من الكوكيز

    // إذا حاول المستخدم الدخول إلى /Dashboard بدون توكن، يتم توجيهه إلى /login
    if (req.nextUrl.pathname.startsWith("/Dashboard") && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// تحديد المسارات التي ينطبق عليها `middleware`
export const config = {
    matcher: ["/Dashboard/:path*"], // يشمل كل صفحات /Dashboard/*
};
