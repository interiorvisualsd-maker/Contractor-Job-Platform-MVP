"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function logoutAction() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
