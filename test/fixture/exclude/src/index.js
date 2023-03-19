import styles from "./simple.module.scss";
import "./index.scss";
import "../external/index.css";

document.body.insertAdjacentHTML("afterbegin", `
    <div class="${styles.message}">Hello World</div>
`);