import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "@/utils/tbase/database";
import { UserProvider } from "../(components)/userProvider";
import Sidebar from "../(components)/sidebar";
import Navbar from "../(components)/navbar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("t_auth_super")?.value;

  // Check for token
  if (!token) {
    redirect("/-tbase/auth");
  }


  // Get the initialized database instance
  const db = getDatabase();

  if (!db) {
    console.error("Database is not initialized");
    redirect("/-tbase/auth");
  }

  // Perform database operations
  let session, user;
  try {
    session = await db.getSession(token);
  } catch (error) {
    console.error("Error fetching session:", error);
    redirect("/-tbase/auth");
  }

  if (!session) {
    console.error("Session not found");
    redirect("/-tbase/auth");
  }

  try {
    const res = await db.getUser(session.sessionId);
    user = res.user || res;
  } catch (error) {
    console.error("Error fetching user:", error);
    redirect("/-tbase/auth");
  }

  if (!user || !user.isSuper) {
    console.error("User not found or not a super user");
    redirect("/-tbase/auth");
  }

  // Manually convert user to a plain object, handling MongoDB _id and other complex types
  const simplifiedUser = {
    id: user._id ? user._id.toString() : user.id.toString(), // Convert _id to string if present
    email: user.email || "",
    password: user.password || "", // Avoid passing sensitive data if possible
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : "",
    teams: user.teams || [],
    labels: user.labels || [],
    verified: user.verified || false,
    isSuper: user.isSuper || false,
    updatedAt: user.updated_at ? new Date(user.updated_at).toISOString() : "",
    preferences: user.preferences || {},
  };

  return (
    <UserProvider user={simplifiedUser}>
      <div id="admin" className="flex min-h-screen bg-base-100 text-white antialiased">
        <Sidebar/>
        <div className="flex-1 flex flex-col">
          <Navbar/>
          <main className="px-6 py-1">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}