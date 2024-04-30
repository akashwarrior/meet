import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [type, setType] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  async function loginOrSignup() {
    if (loading) return;
    if (!email) {
      alert("Email is required");
      return;
    }
    if (!password) {
      alert("Password is required");
      return;
    }
    setLoading(true);
    if (!type) {
      if (!name) {
        alert("Name is required");
        return type;
      }

      getDoc(doc(db, "count", "users")).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const count = data.count + 1;
          createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
              const user = userCredential.user;
              console.log(user);
              await updateProfile(user, { displayName: name, photoURL: count.toString() });
              await setDoc(doc(db, count.toString(), "details"), { uid: count });
              navigate(-1);
            }).catch((error) => { alert("from register " + error.message); setLoading(false); });
          setDoc(doc(db, "count", "users"), { count });
        }
      }).catch((error) => { alert("from getdoc " + error.message); setLoading(false); });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate(-1);
        }).catch((error) => { alert("from login " + error.message); setLoading(false); });
    }
  }

  return (
    <section className="login_container">
      <form onSubmit={loginOrSignup} className="loginSection">
        <p className="loginTitle">{type ? "Login" : "Register"}</p>
        <br />
        {
          !type && <>
            <input
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              className="inputBox"
              type="text"
            />
            <br />
          </>
        }
        <input
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="inputBox"
          required
          type="email"
        />
        <br />
        <input
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          className="inputBox"
          required
          type="password"
        />
        <br />
        <button type="submit" onClick={(e) => { e.preventDefault(); loginOrSignup() }}>{!loading ? (type ? "Login" : "Register") : "Loading..."}</button>
        <p>
          {type ? "Don't have account? " : "Already have an account "}
          <span onClick={() => setType(type => !type)} className="register">
            {!type ? "Login" : "Register"}
          </span>
        </p>
      </form>
    </section>
  )
};
