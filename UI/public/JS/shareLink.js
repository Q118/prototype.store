console.log("sanity check")
/**
 * @summary - this file to hold the logic of sharing permalink. User to click it and copies to clipboard SO THAT they can share it to members of their team
 */

const shareButtons = document.getElementsByClassName("shareButton");


for (let i = 0; i < shareButtons.length; i++) {
    shareButtons[i].addEventListener("click", () => {

        let copyText = window.location.href + "#" + shareButtons[i].parentElement.id;
        copyText = copyText.replace(".json", "");
        
        navigator.clipboard.writeText(copyText);

        //TODO prepend to the copyText the link to the page and a "#"
        console.log(`${copyText} Copied to clipboard`);
        // console.log(`${window.location.href}`);
        shareButtons[i].innerHTML = "Copied!";

        setTimeout(() => {
            shareButtons[i].innerHTML = "Share";
        }, 2000);

    
    })
}

