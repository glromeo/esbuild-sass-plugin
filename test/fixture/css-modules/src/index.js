import styles from "./example.module.scss";
import common from "./common.module.scss";

document.body.insertAdjacentHTML("afterbegin", `
    <div class="${styles.message} ${common.message}">Hello World</div>
`);