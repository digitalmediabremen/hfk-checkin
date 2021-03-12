const scrollParent = require("scrollparent");
import smoothscroll from 'smoothscroll-polyfill';
import { isClient } from '../../config';


export const scrollIntoView = (element: HTMLInputElement, offsetTop: number = 80) => {
    if (isClient) smoothscroll.polyfill();
    const scrollableParent = scrollParent(element);


    const elementPosition =
        element.getBoundingClientRect().top + scrollableParent.scrollTop;
    const offsetPosition = elementPosition - offsetTop;


    scrollableParent.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
    });
};