import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate();

  return (
    <>
        <h1>Вітаємо у SpoilIQ</h1>
        <button onClick={() => navigate('/login')}>Вхід</button>
        <button onClick={() => navigate('/register')}>Реєстрація</button>
    </>
  )
}

export default Home