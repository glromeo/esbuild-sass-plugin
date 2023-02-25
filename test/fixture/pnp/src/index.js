import React from "react"
import ReactDOM from "react-dom"

import "@fluentui/react/dist/sass/_References.scss";
import "bootstrap/scss/bootstrap.scss";
import styles from "./index.scss"

const App = () => {
  return <span>test</span>
}

ReactDOM.render(
  <React.StrictMode>
    <div className={styles.Root}>
      <App/>
    </div>
  </React.StrictMode>,
  document.getElementById("app")
)
