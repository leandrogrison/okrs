import React, { createContext } from 'react'
export const UserContext = createContext()
const UserAuthProvider = (props) => {
    const UserAuth = {
      "id": 1,
      "name": "Maurício Ribeiro Andrade",
      "photo": "https://randomuser.me/api/portraits/men/89.jpg"
    }
    return (
      <UserContext.Provider value={UserAuth}>
        {props.children}
      </UserContext.Provider>
    )
}
export default UserAuthProvider