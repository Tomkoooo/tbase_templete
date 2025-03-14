// layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "@/utils/tbase/database";
import { UserProvider } from "../(components)/userProvider";


export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookiesStore = await cookies();
  const token = cookiesStore.get('t_auth_super')?.value;

  // A middleware már ellenőrizte, hogy van token, de itt további ellenőrzést végzünk
  if (!token) {
    redirect('/-tbase/auth');
    return null;
  }

  const databaseChoice = process.env.NEXT_PUBLIC_DATABASE_CHOICE;
  if (!databaseChoice) {
    console.error('Please set the database choice in the .env file');
    return null;
  }

  const db = database

  try {
    const userId = await db.getSession(token);
    if (!userId) {
      redirect('/-tbase/auth');
      return null;
    }

    const user = await db.getUser(userId);
    if (!user || !user.isSuper) {
      redirect('/-tbase/auth');
      return null;
    }

    return (
      <UserProvider user={user}>
        <div id="admin" className={`antialiased min-h-screen`}>
          {children}
        </div>
      </UserProvider>
    );
  } catch (error) {
    console.error('Database error in layout:', error);
    redirect('/-tbase/auth');
    return null;
  }
}