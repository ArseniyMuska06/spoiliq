async function checkAuth() {
    const result = await authMe()
    if (result.success === true) navigate('/dashboard')
}

export default checkAuth