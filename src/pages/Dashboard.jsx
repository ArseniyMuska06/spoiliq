import { useEffect, useState } from "react"
import { authMe, logoutUser } from "../api/Requests"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null)

    async function handleLogout() {
        try {
            const result = await logoutUser()
            if (result.success === true) {
                navigate('/')
            }
        } catch(err) {
            alert(`Помилка: ${err.message}`)
        }
    }

    useEffect(() => {
        async function protectedRoute() {
            try {
                const result = await authMe()

                setUserData(result)

                if (result.success === false) navigate('/login')
            } catch(err) {
                navigate('/login')
            }
        }
            
        protectedRoute()
    }, [])

    return (
        <>
            <h1>Welcome to the Dashboard</h1>
            <button onClick={handleLogout}>Вихід</button>
            {userData && (
                <>
                    <p>Ім'я: {userData.user.firstName}</p>
                    <p>Прізвище: {userData.user.lastName}</p>
                    <p>Заклад: {userData.organization.name}</p>
                    <p>Точка: {userData.branch.name}</p>
                </>
            )}
        </>
    )
}

export default Dashboard