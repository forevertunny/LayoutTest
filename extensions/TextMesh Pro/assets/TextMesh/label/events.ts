import { CharInfo } from "./CharInfo";

export class EventClickChar {
    accurate?: boolean;
    charInfo?: CharInfo;
}
export const click_char_event = new EventClickChar;