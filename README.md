# Remote-Connection
This repo contains react js using vite and firebase for server and both screen reciever and sender have to be either on same network or one of the device should be on mobile data otherwise it will not be able to find IP.

RD-share is similar version of screen sharing but with better UI and without needed of websocket because that part handled by firebase's cloud firestore and also this time login is neccessay to access the website so firestore stays less loaded from annonymous users. To get started with this project locally just make a firebase.tsx file in src directory with your firebase credentials and export getAuth() as auth and getFirestore() as db and you are good to go. 

you can also check https://remoteshare.web.app to check this project live also open to update and fix issue so don't mind creating issue or merging something.
