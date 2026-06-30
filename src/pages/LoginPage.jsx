import { useState, useEffect } from 'react'
import { loginUser } from '../api/Requests'
import { useNavigate } from 'react-router-dom'
import checkAuth from '../components/checkAuth';

function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth()
    }, [])

    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")

    return (
        <>
            <h1>Вхід</h1>
            <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                    const result = await loginUser(emailInput, passwordInput)
                    if (result.success === true) {
                        navigate('/dashboard')
                    }
                } catch(err) {
                    const message = err.response?.data?.message || err.message

                    if (message === 'Схоже, такого користувача не існує') {
                        alert(message)
                    } else if (message === 'Невірний пароль') {
                        alert(message)
                    } else {
                        alert(`Помилка під час входу: ${err.message}`)
                    }
                }
            }}>
                <p>
                    <label htmlFor="email-input">Електронна пошта: </label>
                    <input type="email" name="email" id="email-input" onChange={(e) => setEmailInput(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="password-input">Пароль: </label>
                    <input type="password" name="password" id="password-input" onChange={(e) => setPasswordInput(e.target.value)} required />
                </p>
                <button type="reset">Очистити</button>
                <button type="submit">Увійти</button>
            </form>
        </>
    )
}

export default LoginPage