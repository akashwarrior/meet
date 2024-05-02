import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import '../styles/Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [type, setType] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useState(() => {
    auth.onAuthStateChanged(authUser => {
      if (authUser) {
        navigate('/');
      }
    });
  })

  const loginOrSignup = (e: any) => {
    e.preventDefault();
    if (loading) return;

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
        return;
      }

      setLoading(true);
      getDoc(doc(db, "count", "users")).then(snapshot => {
        const data = snapshot.data();
        const count = data?.count + 1;
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => updateProfile(
            userCredential.user, { displayName: name, photoURL: count.toString() }
          ))
          .then(() => setDoc(doc(db, count.toString(), "details"), { uid: count }))
          .then(() => updateDoc(doc(db, "count", "users"), { count }))
          .then(() => navigate('/'))
          .catch((error) => { alert("Error in register : " + error.message); setLoading(false); });
      }).catch(() => { alert("Error happend please try again"); setLoading(false); });
    } else {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(() => navigate('/'))
        .catch((error) => { alert("Error in login " + error.message); setLoading(false); });
    }
  }

  return (
    <section className="login_container">
      <form onSubmit={loginOrSignup} className="loginSection">
        <p className="loginTitle">{type ? "Login" : "Register"}</p>
        <br />
        {!type && <>
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
          name="email"
          value={email}
          className="inputBox"
          placeholder="Enter your email"
          onChange={e => setEmail(e.target.value)}
          type="email"
        />
        <br />
        <input
          value={password}
          className="inputBox"
          placeholder="Enter your password"
          onChange={e => setPassword(e.target.value)}
          type="password"
        />
        <br />
        <button type="submit" onClick={loginOrSignup}>{!loading ? (type ? "Login" : "Register") : "Loading..."}</button>
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
