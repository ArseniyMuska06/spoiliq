import { useState, useEffect } from 'react'
import { registerUser } from '../api/Requests'
import { useNavigate } from 'react-router-dom'
import checkAuth from '../components/checkAuth';

function RegisterPage() {
    const navigate = useNavigate();

    useEffect(() => {    
        checkAuth()
    }, [])

    const [firstNameInput, setFirstNameInput] = useState("")
    const [lastNameInput, setLastNameInput] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [organizationInput, setOrganizationInput] = useState("")

    const isValidPassword = 
        (passwordInput.length >= 8) &&
        (/[A-Za-zА-Яа-яЇїІіЄєҐґ]/.test(passwordInput)) &&
        (/[0-9]/.test(passwordInput))

    return (
        <>
            <h1>Реєстрація</h1>
            <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                    const result = await registerUser(firstNameInput, lastNameInput, emailInput, passwordInput, organizationInput)
                    if (result.success === true) {
                        alert('Реєстрація пройшла успішно!')
                        navigate('/dashboard')
                    }
                } catch(err) {
                    const message = err.response?.data?.message || err.message

                    if (message === 'Користувач з таким email вже існує') {
                        alert(message)
                    } else {
                        alert(`Помилка під час реєстрації: ${err.message}`)
                    }
                }
            }}>
                <p>
                    <label htmlFor="first-name-input">Ім'я: </label>
                    <input type="text" name="firstName" id="first-name-input" onChange={(e) => setFirstNameInput(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="last-name-input">Прізвище: </label>
                    <input type="text" name="lastName" id="last-name-input" onChange={(e) => setLastNameInput(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="email-input">Електронна пошта: </label>
                    <input type="email" name="email" id="email-input" onChange={(e) => setEmailInput(e.target.value)} required />
                </p>
                <p>
                    <label htmlFor="password-input">Пароль: </label>
                    <input type="password" name="password" id="password-input" onChange={(e) => setPasswordInput(e.target.value)} required />
                </p>
                <>
                    <p>{(passwordInput.length > 0 && passwordInput.length < 8) && "Пароль має містити мінімум 8 символів" }</p>
                    
                    <p>{(passwordInput.length > 0 && !/[A-Za-zА-Яа-яЇїІіЄєҐґ]/.test(passwordInput)) && "Пароль має містити хоча б одну літеру"}</p>

                    <p>{(passwordInput.length > 0 && !/[0-9]/.test(passwordInput)) && "Пароль має містити хоча б одну цифру"}</p>
                </>
                <p>
                    <label htmlFor="organization-input">Назва закладу: </label>
                    <input type="text" name="organization" id="organization-input" onChange={(e) => setOrganizationInput(e.target.value)} required />
                </p>
                <button type="reset">Очистити</button>
                <button disabled={!isValidPassword} type="submit">Зареєструватися</button>
            </form>
        </>
    )
}

export default RegisterPage