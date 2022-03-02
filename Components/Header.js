import { useSession, signIn, signOut } from "next-auth/react";
function Header() {
  const { data: session } = useSession();

  if (session) {
    console.log(session);
    return (
      <header>
        Signed in as {session.admin.adminName} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </header>
    );
  } else if (!session) {
    return (
      <header>
        Not Logged in
        <button onClick={() => signIn()}>Sign In</button>
      </header>
    );
  }
}

export default Header;
