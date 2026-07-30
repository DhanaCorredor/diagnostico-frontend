import AppRouter from './router'
import ConnectionNotice from './components/molecules/ConnectionNotice'

export default function App() {
  return (
    <>
      <ConnectionNotice />
      <AppRouter />
    </>
  )
}
