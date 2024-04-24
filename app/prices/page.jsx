import SuitesListContainer from './suites-list-container/suites-list-container'
import styles from './page.module.scss'

export default function Prices() {
  return (
    <main className={`container-fluid ${styles.main}`}>
      <SuitesListContainer />
    </main>
  )
}