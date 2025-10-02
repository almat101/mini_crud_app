import { createContext, useState, useEffect } from 'react';

//impostato auth context a null ( questo avviene all'avvio dell app )
export const AuthContext = createContext(null);


// provider che deve avvolgere l app e mostrare lo stato ai suoi componenti figli(prende children come argomento)
export const AuthProvider = ({children}) => {
    
    //creazione stato locale a null
    const [token, setToken] = useState(null);
    const [id, setId ] = useState(null);
    const [isAuth, setAuth] = useState(false);

    //Uso di use effect per recuperare il token dal localstorage e salvarlo nello stato
    useEffect(() => {
      
      const token = localStorage.getItem('token',);
      if (token)
        setToken(token);

      const id = localStorage.getItem("id");
      if(id)
        setId(id);

      setAuth(token ? true : false);

    }, []);
    
    const saveId = (newId) => {
      setId(newId);
      localStorage.setItem('id', newId)
    }

    const deleteId = () => {
      setId(null);
        localStorage.removeItem("id");
    }

    //funzione login per aggiornare lo stato e il localstorage e il booleano isAuth
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        setAuth(true);
    };
    
    //funzione logout per aggiornare lo stato e il localstorage e il booleano isAuth
    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        setAuth(false);
    }

    //ritorno il provider con il valore da condividere ai figli
    return (
    <AuthContext.Provider value={{ token, login, logout, id, saveId , deleteId, isAuth}}>
      {children}
    </AuthContext.Provider>
  );
};