import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export const Login = () => {
  const navigate = useNavigate();
  if (auth.currentUser) navigate('/');
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [type, setType] = useState<boolean>(true);

  async function loginOrSignup() {
    if (!email) {
      alert("Email is required");
      return;
    }
    if (!password) {
      alert("Password is required");
      return;
    }
    if (!type) {
      if (!name) {
        alert("Name is required");
        return type;
      }
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docs = doc(db, user.uid, "details");
          await updateProfile(user, { displayName: name });
          await setDoc(docs, { name: name });
          navigate('/');
        }).catch((error) => alert(error.message));

    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/');
        }).catch((error) => alert(error.message));
    }
  }

  return (
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
        type="email"
      />
      <br />
      <input
        value={password}
        placeholder="Enter your password"
        onChange={(e) => setPassword(e.target.value)}
        className="inputBox"
        type="password"
      />
      <br />
      <button type="submit" className="logout" onClick={(e) => { e.preventDefault(); loginOrSignup() }}>{type ? "Login" : "Register"}</button>
      <p>
        {type ? "Don't have account? " : "Already Have an account "}
        <span onClick={() => setType(type => !type)} className="register">
          {!type ? "Login" : "Register"}
        </span>
      </p>
    </form>
  )
};
