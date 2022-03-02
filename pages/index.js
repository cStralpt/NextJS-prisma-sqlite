import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession, signIn, signOut, getSession } from "next-auth/react";
import Layout from "../Components/Layout";

const prisma = new PrismaClient();
export async function getServerSideProps(context) {
  // const admin = await prisma.admin.findMany();
  const admin = await prisma.admin.findUnique({
    where: {
      username: "admin",
    },
  });
  const user = await prisma.users.findMany({
    // take: 5,
    orderBy: [
      {
        id: "desc",
      },
    ],
  });
  return {
    props: {
      users: user,
      admin,
      // pass a session on request
      session: await getSession(context),
    },
  };
}
function Home({ users, admin }) {
  const [grabUsers, setGrabUser] = useState(users);
  const [popUp, setPopUP] = useState([]);
  const [getUniqueUser, setUniqueUser] = useState([]);
  const [getEditUser, setEditUser] = useState();
  const [bulkEdit, setBulkEdit] = useState([]);
  const [editToast, setEditToast] = useState([]);
  const router = useRouter();
  useEffect(() => {
    if (!session) router.push("/Login/Admin");
  }, []);
  // console.log(admin);
  // parse to JSON and parsing again to JS Obj
  const dataJSON = JSON.parse(JSON.stringify(getUniqueUser));

  const refreshUsersList = async () => {
    const res = await fetch("api/Users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ action: "refetchUsers" }),
    });
    const datas = await res.json();
    setGrabUser(datas.users);
    router.replace(router.asPath);
  };
  const registerUser = async (event) => {
    event.preventDefault();
    if (
      !!event.target.firstname.value &&
      !!event.target.lastname.value &&
      !!event.target.phone.value &&
      !!event.target.email.value &&
      !!event.target.userPIP.value &&
      !!event.target.homeaddress.value
    ) {
      // define URL and for element
      const APIurl = "/api/Register";

      // collect files
      const files = event.target.userPIP.files;
      const formData = new FormData();
      formData.append("userPIP", files[0]);
      [
        {
          name: "firstname",
          value: event.target.firstname.value,
        },
        {
          name: "lastname",
          value: event.target.lastname.value,
        },
        {
          name: "phone",
          value: event.target.phone.value,
        },
        {
          name: "email",
          value: event.target.email.value,
        },
        {
          name: "homeaddress",
          value: event.target.homeaddress.value,
        },
      ].map((data) => {
        return formData.append(data.name, data.value);
      });

      // post form data
      const xhr = new XMLHttpRequest();

      xhr.open("POST", APIurl);
      xhr.send(formData);
      xhr.onload = () => {
        // console.log(xhr.responseText);
        if (JSON.parse(xhr.responseText).pesan === "userRegistered") {
          refreshUsersList();
        }
        console.log({ pesan: JSON.parse(xhr.responseText).pesan });
      };
    }
  };
  const deleteUser = async (userID) => {
    const refetch = await fetch("api/Users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ userID: userID, action: "singleDelete" }),
    });
    const res = await refetch.json();
    console.log({ res });
    // make a condition to trigger another function to runs
    if (res.pesan === "userDeleted") refreshUsersList();
    setBulkEdit([]);
  };
  const execUpdateUser = async (event) => {
    event.preventDefault();

    const refetch = await fetch("api/Users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userData: {
          firstname: event.target.firstname.value,
          lastName: event.target.lastname.value,
          phone: event.target.phone.value,
          email: event.target.email.value,
          // userPIP: event.target.userPIP.value,
          homeAddress: event.target.homeaddress.value,
        },
        userID: getEditUser,
        action: "updateUser",
      }),
    });
    const res = await refetch.json();
    if (res.resp === "userUpdated") {
      setPopUP([]);
      refreshUsersList();
    }
  };
  const editUser = async (userID) => {
    const refetch = await fetch("api/Users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userID: userID,
        action: "fetchUniqeUser",
      }),
    });
    const res = await refetch.json();
    setUniqueUser(res.user);
    setEditUser(userID);
    refreshUsersList();
    console.log({ editUSer: userID });
  };
  const execBulkEdit = (data) => {
    if (!!!bulkEdit[0]) {
      setBulkEdit([data]);
      router.replace(router.asPath);
      console.log(bulkEdit);
    } else if (!!bulkEdit[0]) {
      if (bulkEdit.includes(data)) {
        router.replace(router.asPath);
        console.log(bulkEdit);
        // const found = bulkEdit.find((element) => element != data);
        const result = bulkEdit.filter((user) => user != data);
        setBulkEdit(result);
        refreshUsersList;
        console.log({ ada: bulkEdit });
      } else if (!bulkEdit.includes(data)) {
        setBulkEdit([...bulkEdit, data]);
        console.log({ added: data });
        router.replace(router.asPath);
        console.log(bulkEdit);
        // refreshUsersList();
      }
    }
    if (!!bulkEdit[0]) {
      // refreshUsersList();
      setEditToast([1]);
    } else if (!!!bulkEdit[0]) {
      setEditToast([]);
    }
  };
  const bulkDelete = async () => {
    const refetch = await fetch("api/Users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ userID: bulkEdit, action: "bulkDelete" }),
    });
    const res = await refetch.json();
    console.log(res);
    // make a condition to trigger another function to runs
    if (res.pesan === "deleteSucced") {
      refreshUsersList();
      setBulkEdit([]);
      setEditToast([]);
    }
  };
  const { data: session } = useSession();
  if (session) {
    return (
      <Layout>
        <head>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css"
          />
          {/* <link
            rel="stylesheet"
            href="https://unpkg.com/boxicons@latest/css/boxicons.min.css"
          /> */}
        </head>
        <div className={styles.crudContainer}>
          <div className={styles.formContainer}>
            <form
              // action="/api/Register"
              onSubmit={registerUser}
              className={styles.form}
              encType="multipart/form-data"
              method="post"
            >
              <h1 className={styles.heading}>CRUD WITH NEXT JS</h1>
              <div className={styles.formSection1}>
                <div className={styles.fitInp}>
                  <input
                    type="text"
                    autoFocus
                    name="firstname"
                    placeholder="First Name"
                    id="firstname"
                  />
                  <input
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    id="lastname"
                  />
                  <input
                    type="number"
                    name="phone"
                    placeholder="Phone Number"
                    id="phone"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    id="email"
                  />
                </div>
              </div>
              <div className={styles.homeAddress}>
                <textarea
                  id="homeaddress"
                  name="homeaddress"
                  placeholder="Home Address"
                />
              </div>
              <div className={styles.form_regsBtn_pipBtn}>
                <div className={styles.regsBtn}>
                  <button type="submit">Register</button>
                </div>
                <div className={styles.fitInp}>
                  <label className={styles.pipBtn} htmlFor="userPIP">
                    Profile Picture
                  </label>
                  <input type="file" name="userPIP" id="userPIP" />
                </div>
              </div>
            </form>
          </div>
          <div className={styles.usersData_parentContainer}>
            <div className={styles.usersData}>
              {grabUsers.map((data, key) => {
                console.log(data.profilePicture);
                return (
                  <div key={key} className={styles.userData_Container}>
                    <span className={styles.usersData_item_userPIP}>
                      <Image
                        src={`/Users/${data.profilePicture}`}
                        alt="Picture of the author"
                        // width="100%"
                        // height="100%"
                        // width={500}
                        // height={500}
                        sizes={"100vw"}
                        quality={1}
                        layout="fill"
                      />
                    </span>
                    <div className={styles.usersData_item_userData}>
                      <h4 className={styles.userData_full_name}>
                        {`${data.firstname} ${data.lastname}`}
                      </h4>
                      <div className={styles.userData_contacts}>
                        <span>{`+62${data.phone}`}</span>
                        <span />
                        <span>{data.email}</span>
                      </div>
                    </div>
                    <div className={styles.usersData_actionContainer}>
                      <div
                        className={styles.usersData_actionContainer_actionBtn}
                      >
                        <i
                          onClick={() => {
                            setPopUP([data.id]);
                            editUser(data.id);
                          }}
                          className="bx bx-pencil"
                        ></i>
                      </div>
                      <div
                        onClick={() => {
                          deleteUser(data.id);
                          refreshUsersList();
                        }}
                        className={styles.usersData_actionContainer_actionBtn}
                      >
                        <i className="bx bx-trash"></i>
                      </div>
                      <div
                        className={styles.usersData_actionContainer_actionBtn}
                      >
                        <input
                          type="checkbox"
                          id={`${"userCheck"}${data.id}`}
                        />
                        <label
                          onClick={() => {
                            execBulkEdit(data.id);
                            // refreshUsersList();
                            // console.log(!!!bulkEdit[0]);
                          }}
                          htmlFor={`${"userCheck"}${data.id}`}
                        >
                          <i className="bx bx-check"></i>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* <script src="https://unpkg.com/boxicons@2.0.9/dist/boxicons.js"></script> */}
        {popUp.map((data) => {
          if (!!data) {
            // console.log(dataJSON);
            return (
              <div className={styles.editUserContainer}>
                <form
                  onSubmit={execUpdateUser}
                  className={styles.editUser_Form}
                >
                  <div className={styles.editUser_closePopUP}>
                    <i
                      onClick={() => {
                        setPopUP([]);
                      }}
                      className="bx bx-x"
                    ></i>
                  </div>
                  <div className={styles.editUser_input}>
                    <div className={styles.formSection1}>
                      <div className={styles.fitInp}>
                        <input
                          type="text"
                          autoFocus
                          name="firstname"
                          placeholder="First Name"
                          id="firstname"
                          // defaultValue={dataJSON.firstname}
                          value={dataJSON.firstname}
                          onChange={(e) => {
                            setUniqueUser([
                              {
                                firstname: e.target.value,
                              },
                            ]);
                            // console.log(getEditUser);
                          }}
                        />
                        <input
                          type="text"
                          name="lastname"
                          placeholder="Last Name"
                          id="lastname"
                          value={dataJSON.lastname}
                          onChange={(e) => {
                            setUniqueUser([
                              {
                                lastname: e.target.value,
                              },
                            ]);
                          }}
                        />
                        <input
                          type="number"
                          name="phone"
                          placeholder="Phone Number"
                          id="phone"
                          value={dataJSON.phone}
                          onChange={(e) => {
                            setUniqueUser([
                              {
                                phone: e.target.value,
                              },
                            ]);
                          }}
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          id="email"
                          value={dataJSON.email}
                          onChange={(e) => {
                            setUniqueUser([
                              {
                                email: e.target.value,
                              },
                            ]);
                          }}
                        />
                      </div>
                      <div className={styles.editUser_saveBtn}>
                        <button type="submit">SAVE</button>
                      </div>
                    </div>
                    <div className={styles.homeAddress}>
                      <textarea
                        id="homeaddress"
                        name="homeaddress"
                        placeholder="Home Address"
                        value={dataJSON.homeAddress}
                        onChange={(e) => {
                          setUniqueUser([
                            {
                              homeAddress: e.target.value,
                            },
                          ]);
                        }}
                      />
                    </div>
                  </div>
                </form>
              </div>
            );
          }
        })}
        {editToast.map((data, key) => {
          if (!!data) {
            // console.log(dataJSON);
            return (
              <div key={key} className={styles.popUpContainer}>
                <div className={styles.popUpData_bulkEdit}>
                  <label>Remove</label>
                  <label>{bulkEdit.length}</label>
                  <label>Users</label>
                  <label
                    onClick={() => {
                      bulkDelete();
                    }}
                  >
                    <i className="bx bx-trash"></i>
                  </label>
                </div>
              </div>
            );
          }
        })}
      </Layout>
    );
  } else if (!session) {
    return <></>;
  }
}
export default Home;
