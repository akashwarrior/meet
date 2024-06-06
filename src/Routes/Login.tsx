import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate(-1);
    }
  }, []);

  const loginOrSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (!email.current || !email.current.value) {
      alert("Email is required");
      return;
    }

    if (!password.current || !password.current.value) {
      alert("Password is required");
      return;
    }

    if (!type) {
      if (!name.current || !name.current.value) {
        alert("Name is required");
        return;
      }

      setLoading(true);
      getDoc(doc(db, "count", "users")).then(snapshot => {
        const data = snapshot.data();
        const count = data?.count + 1;
        createUserWithEmailAndPassword(auth, email.current?.value || "", password.current?.value || "")
          .then((userCredential) => {
            updateDoc(doc(db, "count", "users"), { count });
            const user = userCredential.user;
            updateProfile(user, { displayName: name.current?.value, photoURL: count.toString() });
            localStorage.setItem("user", JSON.stringify({ displayName: user.displayName, email: user.email, uid: count }));
            setDoc(doc(db, count.toString(), "details"), { uid: count });
            navigate('/');
          })
          .catch((error) => {
            alert("Error in register : " + error.message);
            setLoading(false);
          });
      }).catch(() => {
        alert("Error happend please try again");
        setLoading(false);
      });
    } else {
      setLoading(true);
      signInWithEmailAndPassword(auth, email.current.value, password.current.value)
        .then((user) => {
          localStorage.setItem("user", JSON.stringify({ displayName: user.user.displayName, email: user.user.email, uid: user.user.photoURL }));
          navigate('/');
        })
        .catch((error) => {
          alert("Error in login " + error.message);
          setLoading(false);
        });
    }
  }

  return (
    <section className="login_container">
      <form onSubmit={loginOrSignup} className="loginSection">
        <p className="loginTitle">{type ? "Login" : "Register"}</p>
        <br />
        {!type && <>
          <input
            ref={name}
            placeholder="Enter your name"
            className="inputBox"
            type="text"
          />
          <br />
        </>
        }
        <input
          name="email"
          ref={email}
          className="inputBox"
          placeholder="Enter your email"
          type="email"
        />
        <br />
        <input
          ref={password}
          className="inputBox"
          placeholder="Enter your password"
          type="password"
        />
        <br />
        <button type="submit">{!loading ? (type ? "Login" : "Register") : "Loading..."}</button>
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
