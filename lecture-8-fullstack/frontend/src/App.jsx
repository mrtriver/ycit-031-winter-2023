import React, { useState, useEffect } from "react"
import { useTable } from "react-table"

import { useColumns } from "./App.useColumns"

export function App() {
    const [registerUsername, setRegisterUsername] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")

    const [loginUsername, setLoginUsername] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [data, setData] = useState([])

    useEffect(() => {
        fetch("http://localhost:3333/pets", {
            credentials: "include", // This is needed to send the session ID cookie to the server (if there is one)
        })
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                setData(data)
            })
    }, [])

    const columns = useColumns()

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data })

    function handleRegisterSubmit(e) {
        e.preventDefault()
        console.log("handle register submit")

        setRegisterUsername("")
        setRegisterPassword("")

        fetch("http://localhost:3333/register", {
            method: "POST",
            body: JSON.stringify({
                username: registerUsername,
                password: registerPassword,
            }),
            credentials: "include", // This is needed in POST requests so that the browser sets the cookie into the browser
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            console.log("response", response)
        })
    }

    function handleLoginSubmit(e) {
        e.preventDefault()
        console.log("handle login submit")
    }

    return (
        <div className="App">
            <div style={{ display: "flex", gap: "8px" }}>
                <div className="register-form" style={{ maxWidth: "500px" }}>
                    <h3>Register</h3>
                    <form onSubmit={handleRegisterSubmit}>
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={registerUsername}
                            onChange={(e) =>
                                setRegisterUsername(e.target.value)
                            }
                        />
                        <label>Password</label>
                        <input
                            type="text"
                            name="password"
                            value={registerPassword}
                            onChange={(e) =>
                                setRegisterPassword(e.target.value)
                            }
                        />
                        <input type="submit" value="Submit" />
                    </form>
                </div>

                <div className="login-form" style={{ maxWidth: "500px" }}>
                    <h3>Login</h3>

                    <form onSubmit={handleLoginSubmit}>
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                        />
                        <label>Password</label>
                        <input
                            type="text"
                            name="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </div>

            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()}>
                                    {column.render("Header")}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render("Cell")}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
