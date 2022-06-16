/**
 * @summary - this file to hold the logic of sharing permalink. User to click it and copies to clipboard SO THAT they can share it to members of their team
 */

const shareButtons = document.getElementsByClassName("shareButton");

for (let i = 0; i < shareButtons.length; i++) {
    shareButtons[i].addEventListener("click", () => {
        let copyText = window.location.href; 
        let copyTextArr = copyText.split("#"); // here to account for case when user is on the page from a share and wants to create a new share
        copyText = copyTextArr[0] + "#" + shareButtons[i].parentElement.id;
        navigator.clipboard.writeText(copyText);
        console.log(`${copyText} Copied to clipboard`);
        shareButtons[i].innerHTML = "Copied to clipboard!";
        setTimeout(() => {
            shareButtons[i].innerHTML = "Share";
        }, 2000);
    })
}

