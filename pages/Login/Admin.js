import {
  getSession,
  signIn,
  useSession,
  getProviders,
  getCsrfToken,
} from "next-auth/react";
import { useEffect } from "react";
import styles from "../../styles/LoginAdmin.module.css";
import { useRouter } from "next/router";

const Login = (e) => {
  // e.preventDefault();
  signIn("credentials", {
    username: e.target.username.value,
    password: e.target.password.value,
  });
};

function Admin({ providers }) {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) router.push("/");
  }, []);
  console.log({ providers, session });
  return (
    <form
      onSubmit={Login}
      method="POST"
      className={styles.loginAdmin_Container}
    >
      <div className={styles.loginAdmin_inputContainer}>
        <input type="text" placeholder="Username" name="username" />
        <input type="password" placeholder="Password" name="password" />
        <span>
          <button type="submit">Login</button>
        </span>
      </div>
    </form>
  );
}

// Admin.getInitialProps = async (context) => {
//   const session = await getSession(context);
//   return {
//     session2: session,
//     providers: await getProviders(context),
//     csrfToken: await getCsrfToken(context),
//   };
// };
export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
      providers: await getProviders(context),
    },
  };
}
export default Admin;
