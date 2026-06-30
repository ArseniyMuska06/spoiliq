import axios from "axios";

const SERVER = "http://localhost:3000/api";

export async function registerUser(firstName, lastName, email, password, organizationName) {
    const response = await axios.post(
        `${SERVER}/auth/register`,
        {
            firstName,
            lastName,
            email,
            password,
            organizationName
        },
        {
            withCredentials: true
        }
    )

    return response.data
}

export async function loginUser(email, password) {
    const response = await axios.post (
        `${SERVER}/api/auth/login`,
        {
            email,
            password
        },
        {
            withCredentials: true
        }
    )

    return response.data
}

export async function authMe() {
    const response = await axios.get(
        `${SERVER}/auth/me`,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function logoutUser() {
    const response = await axios.post(
        `${SERVER}/auth/logout`,
        {},
        {
            withCredentials: true
        }
    )

    return response.data
}