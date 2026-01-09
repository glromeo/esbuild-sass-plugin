import { exampleMessage } from "./example.module.scss";
import { common_message } from "./common.module.scss";

document.body.insertAdjacentHTML(
	"afterbegin",
	`<div class="${common_message} ${exampleMessage}">Hello World</div>`,
);
