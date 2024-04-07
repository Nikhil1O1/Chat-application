import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    useEffect(()=>{
        axios.get('/profile').then(response=>{
            console.log('this is user res data ', response.data);
            setId(response.data.userData.id);
            setUsername(response.data.userData.username);
        })
    },[]);
    return(
        <UserContext.Provider value = {{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    );
}