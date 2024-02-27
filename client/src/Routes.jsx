import LoginAndRegister from "./loginAndRegister.jsx";
import { useContext } from "react";
import {UserContext} from "./UserContext.jsx";

export default function Routes(){
    const {username, id} = useContext(UserContext);

    if(username){
        return "logged In! "+username ;
    }
    return(
        <LoginAndRegister/>
    );
}