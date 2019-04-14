import findNextBracket from "./BracketFinder.js";
/**
 * 
 * @param {Text} parentElt
 * @param {number} x
 * @param {number} y
 * @returns {{character: string, offset: number, rect:DOMRect}}
 */
function findClickedWord(parentElt, x, y) {
    if (parentElt.nodeName !== '#text') {
        console.log('didn\'t click on text node');
        return null;
    }

    const chars = parentElt.textContent.split('');
    const range = document.createRange();
    // test if the click is even in the node
    range.setStart(parentElt, 0);
    

    range.setEnd(parentElt, chars.length-1);
    let rects = range.getClientRects();
    if (!isClickInRects(rects, x, y)) {
        //console.log("Element does not contain click coords.");
        return null;
    }
    
    
    var start = 0;
    var end = 0;
    for (let i = 0, l = chars.length; i < l; ++i) {
        var character = chars[i];
        end = start + 1;
        range.setStart(parentElt, start);
        range.setEnd(parentElt, end);
        // not getBoundingClientRect as word could wrap
        rects = range.getClientRects();
        var clickedRect = isClickInRects(rects, x, y);
        if (clickedRect) {
            return { character: character, offset: i, rect: clickedRect}//[character, start, clickedRect];
        }
        start++;
    }
    return null;
}
/**
 * 
 * @param {Text} textNode
 * @param {number} position
 */
function charRect(textNode, position) {
    const range = document.createRange();
    range.setStart(textNode, position);
    range.setEnd(textNode, position + 1);
    return range.getBoundingClientRect();
}
function isClickInRects(rects, x, y) {
    for (var i = 0; i < rects.length; ++i) {
        var r = rects[i]
        if (r.left < x && r.right > x && r.top < y && r.bottom > y) {
            return r;
        }
    }
    return false;
}
const highlight_letter = document.createElement("div");
highlight_letter.className = "highlight";
document.body.appendChild(highlight_letter);

const highlight_bracket = document.createElement("div");
highlight_bracket.className = "highlight";
document.body.appendChild(highlight_bracket);


window.addEventListener("click", function (event) {

    const element = document.elementFromPoint(event.clientX, event.clientY);

    const walkerTexasRanger = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    /** @type {Node} **/
    let n = null;
    while (n = walkerTexasRanger.nextNode()) {
        let result = findClickedWord(n, event.clientX, event.clientY);
        if (result) {
            console.log(result.rect.top, result.rect.left);
            moveElmToRect(highlight_letter, result.rect);
            // try to find matching bracket
            if (result.character == "{" || 
                result.character == "(" ||
                result.character == "["
                ) {
                const bracketIndex = findNextBracket(n.textContent, result.offset);
                const chrct = charRect(n, bracketIndex);
                moveElmToRect(highlight_bracket, chrct);
            }
        }
        //else
        //console.log("No result in ", n);
        break;
    }
});
/**
 * 
 * @param {HTMLElement} element
 * @param {DOMRect} rect
 */
function moveElmToRect(element, rect) {
    element.style.top = (rect.top + window.scrollY) + "px";
    element.style.left = (rect.left + window.scrollX)  + "px";

    element.style.width = (rect.right - rect.left) + "px";
    element.style.height = (rect.bottom - rect.top) + "px";
}